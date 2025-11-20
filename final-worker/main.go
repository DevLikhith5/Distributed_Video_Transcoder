package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"net/http"
	  "bytes"
    "encoding/json"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
)

type Rendition struct {
	Name      string
	Width     int
	Height    int
	Bitrate   string
	MaxRate   string
	BufSize   string
	FolderIdx int
}

type VideoInfo struct {
	FPS      string
	HasAudio bool
	HasGPU   bool
}

type UploadStats struct {
	Total     int
	Completed int
	Failed    int
	mu        sync.Mutex
}

func (s *UploadStats) Increment(success bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Completed++
	if !success {
		s.Failed++
	}
}

func (s *UploadStats) Log() {
	s.mu.Lock()
	defer s.mu.Unlock()
	log.Printf("Upload Progress: %d/%d completed (%d failed)", s.Completed, s.Total, s.Failed)
}


func detectGPU() bool {
	cmd := exec.Command("nvidia-smi")
	if err := cmd.Run(); err == nil {
		log.Printf("NVIDIA GPU detected, enabling hardware acceleration")
		return true
	}
	log.Printf("No GPU acceleration available, using CPU encoding")
	return false
}

// Get FPS and audio info
func getVideoInfo(inputFile string) VideoInfo {
	info := VideoInfo{}

	// Detect audio
	cmd := exec.Command("ffprobe", "-v", "quiet", "-select_streams", "a", "-show_entries", "stream=index", "-of", "flat", inputFile)
	output, err := cmd.Output()
	if err != nil {
		info.HasAudio = false
	} else {
		info.HasAudio = len(strings.TrimSpace(string(output))) > 0
	}

	// Detect FPS
	cmd = exec.Command("ffprobe", "-v", "quiet", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=s=x:p=0", inputFile)
	output, err = cmd.Output()
	if err != nil {
		info.FPS = "25"
	} else {
		parts := strings.Split(strings.TrimSpace(string(output)), "/")
		if len(parts) == 2 {
			if num, err1 := strconv.ParseFloat(parts[0], 64); err1 == nil {
				if den, err2 := strconv.ParseFloat(parts[1], 64); err2 == nil && den != 0 {
					info.FPS = strconv.FormatFloat(num/den, 'f', 2, 64)
				}
			}
		}
	}

	info.HasGPU = detectGPU()
	return info
}

// Utilities
func parseFloat(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func getOptimalWorkers() int {
	cpus := runtime.NumCPU()
	switch {
	case cpus <= 2:
		return 1
	case cpus <= 4:
		return 2
	case cpus <= 8:
		return 3
	default:
		return 4
	}
}

// Download from S3 with retry
func downloadFromS3(client *s3.Client, bucket, key, localPath string, maxRetries int) error {
	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := downloadFromS3Once(client, bucket, key, localPath)
		if err == nil {
			log.Printf("Successfully downloaded %s", key)
			return nil
		}

		if attempt < maxRetries {
			waitTime := time.Duration(attempt*2) * time.Second
			log.Printf("Download attempt %d/%d failed: %v. Retrying in %v...", attempt, maxRetries, err, waitTime)
			time.Sleep(waitTime)
		}
	}
	return fmt.Errorf("download failed after %d attempts", maxRetries)
}

func downloadFromS3Once(client *s3.Client, bucket, key, localPath string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	out, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("S3 GetObject failed: %w", err)
	}
	defer out.Body.Close()

	f, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("failed to create local file: %w", err)
	}
	defer f.Close()

	_, err = io.Copy(f, out.Body)
	if err != nil {
		os.Remove(localPath) // Clean up partial file
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}
func notifyStatus(videoId, status string) {
	payload := map[string]string{
		"videoId": videoId,
		"status":  status,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Failed to marshal JSON: %v", err)
		return
	}

	url := "http://localhost:8080/video/update-video-status-worker"
	log.Printf("Sending status update to %s with payload: %s", url, string(jsonData))

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Failed to create request: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed API call: %v", err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	log.Printf("Status update sent: %s. Response: %d - %s", status, resp.StatusCode, string(body))
}


// Upload single file with retry
func uploadFileToS3(client *s3.Client, bucket, localPath, s3Key string, maxRetries int) error {
	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := uploadFileToS3Once(client, bucket, localPath, s3Key)
		if err == nil {
			return nil
		}

		if attempt < maxRetries {
			waitTime := time.Duration(attempt) * time.Second
			log.Printf("Upload attempt %d/%d failed for %s: %v. Retrying in %v...", 
				attempt, maxRetries, s3Key, err, waitTime)
			time.Sleep(waitTime)
		}
	}
	return fmt.Errorf("upload failed after %d attempts", maxRetries)
}

func uploadFileToS3Once(client *s3.Client, bucket, localPath, s3Key string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	f, err := os.Open(localPath)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer f.Close()

	// Get file size for progress tracking
	stat, _ := f.Stat()
	size := stat.Size()

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(s3Key),
		Body:   f,
	})

	if err != nil {
		return fmt.Errorf("S3 PutObject failed: %w", err)
	}

	log.Printf("✓ Uploaded: %s (%.2f MB)", s3Key, float64(size)/(1024*1024))
	return nil
}

// Walk directory and collect all files
func collectFiles(rootDir string) ([]string, error) {
	var files []string
	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			files = append(files, path)
		}
		return nil
	})
	return files, err
}

// Upload folder with parallel workers and progress tracking
func uploadFolderToS3(client *s3.Client, bucket, localDir, prefix string, workers int) error {
	log.Printf("Collecting files to upload from %s...", localDir)
	
	files, err := collectFiles(localDir)
	if err != nil {
		return fmt.Errorf("failed to collect files: %w", err)
	}

	if len(files) == 0 {
		return fmt.Errorf("no files found in %s", localDir)
	}

	log.Printf("Found %d files to upload. Starting upload with %d workers...", len(files), workers)

	stats := &UploadStats{Total: len(files)}
	

	fileChan := make(chan string, len(files))
	for _, file := range files {
		fileChan <- file
	}
	close(fileChan)


	var errorsMu sync.Mutex
	var errors []error


	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			
			for localPath := range fileChan {
				relPath, _ := filepath.Rel(localDir, localPath)
				s3Key := filepath.Join(prefix, relPath)
				
				// Use forward slashes for S3 keys
				s3Key = filepath.ToSlash(s3Key)
				
				log.Printf("[Worker %d] Uploading: %s", workerID, s3Key)
				
				err := uploadFileToS3(client, bucket, localPath, s3Key, 3)
				
				success := err == nil
				stats.Increment(success)
				
				if err != nil {
					errorsMu.Lock()
					errors = append(errors, fmt.Errorf("%s: %w", s3Key, err))
					errorsMu.Unlock()
					log.Printf("[Worker %d] ✗ Failed: %s - %v", workerID, s3Key, err)
				}
				
				// Log progress every 10 files
				if stats.Completed%10 == 0 || stats.Completed == stats.Total {
					stats.Log()
				}
			}
		}(i)
	}

	wg.Wait()
	stats.Log()

	if len(errors) > 0 {
		log.Printf("Upload completed with %d errors:", len(errors))
		for i, err := range errors {
			if i < 10 { // Log first 10 errors
				log.Printf("  - %v", err)
			}
		}
		if len(errors) > 10 {
			log.Printf("  ... and %d more errors", len(errors)-10)
		}
		return fmt.Errorf("upload incomplete: %d/%d files failed", len(errors), len(files))
	}

	log.Printf("✓ All %d files uploaded successfully", len(files))
	return nil
}

// Clean temporary paths
func cleanTmp(paths ...string) {
	for _, p := range paths {
		if err := os.RemoveAll(p); err != nil {
			log.Printf("Warning: failed to clean up %s: %v", p, err)
		} else {
			log.Printf("Cleaned up: %s", p)
		}
	}
}

// Transcode single rendition
func transcodeRendition(ctx context.Context, inputFile string, rendition Rendition, outputBase string, 
	segmentTime string, videoInfo VideoInfo, semaphore chan struct{}) error {
	
	semaphore <- struct{}{}
	defer func() { <-semaphore }()

	outputDir := filepath.Join(outputBase, fmt.Sprintf("cmaf_stream_%d", rendition.FolderIdx))
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}
	
	playlistPath := filepath.Join(outputDir, "prog_index.m3u8")

	args := []string{"-y", "-i", inputFile, "-vf", fmt.Sprintf("scale=%d:%d", rendition.Width, rendition.Height)}
	
	if videoInfo.HasGPU {
		args = append(args, "-c:v", "h264_nvenc")
	} else {
		args = append(args, "-c:v", "libx264", "-preset", "faster")
	}
	
	args = append(args,
		"-b:v", rendition.Bitrate,
		"-maxrate", rendition.MaxRate,
		"-bufsize", rendition.BufSize,
		"-g", fmt.Sprintf("%.0f", parseFloat(videoInfo.FPS)*2),
		"-keyint_min", fmt.Sprintf("%.0f", parseFloat(videoInfo.FPS)),
		"-sc_threshold", "0",
		"-r", videoInfo.FPS,
	)
	
	if videoInfo.HasAudio {
		args = append(args, "-c:a", "aac", "-b:a", "128k", "-ac", "2")
	}
	
	args = append(args,
		"-f", "hls",
		"-hls_time", segmentTime,
		"-hls_playlist_type", "vod",
		"-hls_segment_type", "fmp4",
		"-hls_fmp4_init_filename", "init.mp4",
		"-hls_segment_filename", filepath.Join(outputDir, "seg_%d.m4s"),
		playlistPath,
	)

	cmd := exec.Command("ffmpeg", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start ffmpeg: %w", err)
	}

	done := make(chan error, 1)
	go func() { done <- cmd.Wait() }()

	select {
	case <-ctx.Done():
		if cmd.Process != nil {
			cmd.Process.Kill()
		}
		return ctx.Err()
	case err := <-done:
		if err != nil {
			return fmt.Errorf("ffmpeg failed: %w", err)
		}
		return nil
	}
}

// Create master playlist
func createMasterPlaylist(renditions []Rendition, outputBase string, videoInfo VideoInfo) error {
	masterPath := filepath.Join(outputBase, "master.m3u8")
	file, err := os.Create(masterPath)
	if err != nil {
		return fmt.Errorf("failed to create master playlist: %w", err)
	}
	defer file.Close()

	file.WriteString("#EXTM3U\n#EXT-X-VERSION:6\n\n")

	for _, r := range renditions {
		bitrateStr := strings.TrimSuffix(r.Bitrate, "k")
		bandwidth := bitrateStr + "000"
		if videoInfo.HasAudio {
			if bw, err := strconv.Atoi(bitrateStr); err == nil {
				bandwidth = strconv.Itoa(bw*1000 + 128000)
			}
		}
		codecs := "avc1.640020"
		if videoInfo.HasAudio {
			codecs = "avc1.640020,mp4a.40.2"
		}

		file.WriteString(fmt.Sprintf(
			"#EXT-X-STREAM-INF:BANDWIDTH=%s,RESOLUTION=%dx%d,CODECS=\"%s\",FRAME-RATE=%s\n",
			bandwidth, r.Width, r.Height, codecs, videoInfo.FPS,
		))
		file.WriteString(fmt.Sprintf("cmaf_stream_%d/prog_index.m3u8\n\n", r.FolderIdx))
	}

	log.Printf("✓ Master playlist created: %s", masterPath)
	return nil
}


func verifyOutputStructure(outputBase string, renditions []Rendition) error {
	log.Println("Verifying transcoded output structure...")
	

	masterPath := filepath.Join(outputBase, "master.m3u8")
	if _, err := os.Stat(masterPath); err != nil {
		return fmt.Errorf("master playlist not found: %w", err)
	}
	

	for _, r := range renditions {
		dirName := fmt.Sprintf("cmaf_stream_%d", r.FolderIdx)
		dirPath := filepath.Join(outputBase, dirName)
		

		if _, err := os.Stat(dirPath); err != nil {
			return fmt.Errorf("rendition directory %s not found: %w", dirName, err)
		}
		

		playlistPath := filepath.Join(dirPath, "prog_index.m3u8")
		if _, err := os.Stat(playlistPath); err != nil {
			return fmt.Errorf("playlist for %s not found: %w", r.Name, err)
		}
		

		initPath := filepath.Join(dirPath, "init.mp4")
		if _, err := os.Stat(initPath); err != nil {
			return fmt.Errorf("init segment for %s not found: %w", r.Name, err)
		}
		

		files, _ := os.ReadDir(dirPath)
		segmentCount := 0
		for _, f := range files {
			if strings.HasPrefix(f.Name(), "seg_") && strings.HasSuffix(f.Name(), ".m4s") {
				segmentCount++
			}
		}
		
		log.Printf("  ✓ %s: playlist + init + %d segments", r.Name, segmentCount)
	}
	
	log.Println("✓ Output structure verified successfully")
	return nil
}

func main() {
	startTime := time.Now()
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	

	if err := godotenv.Load(".env"); err != nil {
		log.Printf("Warning: .env file not found, using environment variables")
	}
	
	inputBucket := os.Getenv("JOB_BUCKET")
	inputKey := os.Getenv("JOB_KEY")
	outputBucket := os.Getenv("OUTPUT_BUCKET")
	jobId := os.Getenv("JOB_KEY")
	

	if inputBucket == "" || inputKey == "" || outputBucket == "" {
		log.Fatal("Missing required environment variables: JOB_BUCKET, JOB_KEY, OUTPUT_BUCKET")
	}
	fmt.Println("PROCESSING....")
	notifyStatus(jobId, "PROCESSING")


	log.Printf("=== Starting Transcoding Job ===")
	log.Printf("Job ID: %s", jobId)
	log.Printf("Input: s3://%s/%s", inputBucket, inputKey)
	log.Printf("Output: s3://%s/outputs/...", outputBucket)

	inputPath := "/tmp/input.mp4"
	outputBase := "/tmp/output"
	

	cleanTmp(inputPath, outputBase)
	
	if err := os.MkdirAll(outputBase, 0755); err != nil {
		log.Fatalf("Failed to create output directory: %v", err)
		notifyStatus(jobId, "FAILED")

	}


	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("Failed to load AWS config: %v", err)
		notifyStatus(jobId, "FAILED")

	}
	s3client := s3.NewFromConfig(cfg)


	log.Println("\n=== Step 1: Downloading Input ===")
	if err := downloadFromS3(s3client, inputBucket, inputKey, inputPath, 3); err != nil {
		log.Fatalf("Download failed: %v", err)
		notifyStatus(jobId, "FAILED")

	}


	log.Println("\n=== Step 2: Analyzing Video ===")
	videoInfo := getVideoInfo(inputPath)
	log.Printf("Video Info: FPS=%.2s, Audio=%v, GPU=%v", videoInfo.FPS, videoInfo.HasAudio, videoInfo.HasGPU)


	log.Println("\n=== Step 3: Transcoding ===")
	renditions := []Rendition{
		{"4K", 3840, 2160, "15000k", "16000k", "30000k", 0},
		{"1080p", 1920, 1080, "5000k", "5350k", "10000k", 1},
		{"720p", 1280, 720, "2500k", "2675k", "5000k", 2},
		{"480p", 854, 480, "1200k", "1280k", "2400k", 3},
		{"360p", 640, 360, "800k", "880k", "1600k", 4},
	}

	maxWorkers := getOptimalWorkers()
	if videoInfo.HasGPU {
		maxWorkers = min(maxWorkers+1, len(renditions))
	}
	log.Printf("Using %d parallel workers for transcoding", maxWorkers)

	semaphore := make(chan struct{}, maxWorkers)
	var wg sync.WaitGroup
	var transcodeErrors []error
	var errorsMu sync.Mutex

	for _, r := range renditions {
		wg.Add(1)
		go func(r Rendition) {
			defer wg.Done()
			log.Printf("Starting transcode: %s (%dx%d)", r.Name, r.Width, r.Height)
			
			if err := transcodeRendition(context.Background(), inputPath, r, outputBase, "4", videoInfo, semaphore); err != nil {
				errorsMu.Lock()
				transcodeErrors = append(transcodeErrors, fmt.Errorf("%s: %w", r.Name, err))
				errorsMu.Unlock()
				log.Printf("✗ Failed: %s - %v", r.Name, err)
				notifyStatus(jobId, "FAILED")

			} else {
				log.Printf("✓ Completed: %s", r.Name)


			}
		}(r)
	}
	wg.Wait()

	if len(transcodeErrors) > 0 {
		log.Printf("Transcoding completed with %d errors:", len(transcodeErrors))
		for _, err := range transcodeErrors {
			log.Printf("  - %v", err)
		}
		log.Fatal("Transcoding failed, aborting")
		notifyStatus(jobId, "FAILED")
	}


	log.Println("\n=== Step 4: Creating Master Playlist ===")
	if err := createMasterPlaylist(renditions, outputBase, videoInfo); err != nil {
		log.Fatalf("Failed to create master playlist: %v", err)
		notifyStatus(jobId, "FAILED")
	}


	log.Println("\n=== Step 5: Verifying Output ===")
	if err := verifyOutputStructure(outputBase, renditions); err != nil {
		log.Fatalf("Output verification failed: %v", err)
		notifyStatus(jobId, "FAILED")
	}


	log.Println("\n=== Step 6: Uploading to S3 ===")
	outputPrefix := "outputs/" + strings.TrimSuffix(filepath.Base(inputKey), filepath.Ext(inputKey))
	

	uploadWorkers := min(runtime.NumCPU()*2, 10)
	log.Printf("Using %d parallel workers for upload", uploadWorkers)
	
	if err := uploadFolderToS3(s3client, outputBucket, outputBase, outputPrefix, uploadWorkers); err != nil {
		log.Fatalf("Upload failed: %v", err)
		notifyStatus(jobId, "FAILED")
	}


	log.Println("\n=== Step 7: Cleanup ===")
	_, err = s3client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(inputBucket),
		Key:    aws.String(inputKey),
	})
	if err != nil {
		log.Printf("Warning: Failed to delete original video: %v", err)
		notifyStatus(jobId, "FAILED")
	} else {
		log.Printf("✓ Deleted original video: %s", inputKey)
	}


	cleanTmp(inputPath, outputBase)

	duration := time.Since(startTime)
	log.Printf("\n=== Job Completed Successfully ===")
	log.Printf("Total Duration: %v", duration.Round(time.Second))
	log.Printf("Output Location: s3://%s/%s/", outputBucket, outputPrefix)
	
	notifyStatus(jobId, "COMPLETED")
}