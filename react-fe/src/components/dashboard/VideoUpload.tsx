import { useCallback, useRef, useState } from "react";
import { Upload, File, X, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toasts";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import pLimit from "p-limit";
import { 
  getPresignedUrl, 
  getPresignedUrlsMultipart, 
  completeMultipart, 
  createVideoRecord,
  updateVideoStatus,
} from "@/api/video";
import { useVideoStore, type UploadedVideo, type VideoMetadata } from "@/store/useVideoStore";



interface VideoUploadProps {
  onUploadComplete: (videos: UploadedVideo[]) => void;
  userId?: string;
  multipartThreshold?: number;
}

const CONCURRENCY = 5;

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

export function VideoUpload({ 
  onUploadComplete, 
  userId,
  multipartThreshold = 100 * 512 * 512, 
}: VideoUploadProps) {
  const {
    selectedFiles,
    uploading,
    setUploading,
    addVideos,
    removeVideo,
    updateFileStatus,
    reset,
  } = useVideoStore();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractMetadata = (file: File): Promise<VideoMetadata> =>
    new Promise((resolve, reject) => {
      if (!file.type.startsWith("video/")) {
        reject("Not a valid video file");
        return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          aspectRatio: video.videoWidth / video.videoHeight,
        });
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        reject("Failed to load video metadata");
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });

  const processFiles = async (files: File[]) => {
    const processed: UploadedVideo[] = [];

    for (const file of files) {
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a video file`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const metadata = await extractMetadata(file);
        processed.push({ 
          file, 
          metadata, 
          status: "pending", 
          progress: 0 
        });
      } catch {
        toast({
          title: "Metadata extraction failed",
          description: `Could not process ${file.name}`,
          variant: "destructive",
        });
      }
    }

    addVideos(processed);
  };

  const handleFileChange = async (newFiles: File[]) => {
    await processFiles(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    accept: {
      'video/*': []
    },
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
      toast({
        title: "Upload rejected",
        description: "Please ensure you're uploading valid video files",
        variant: "destructive",
      });
    },
    disabled: uploading,
  });

  const uploadSimple = async (
    file: File,
    metadata: VideoMetadata,
    index: number
  ): Promise<string> => {
    const urlResponse = await getPresignedUrl(file.name, file.type);

    if (!urlResponse.data?.data?.uploadUrl || !urlResponse.data?.data?.key) {
      throw new Error("Failed to get presigned URL");
    }

    const { uploadUrl, key } = urlResponse.data.data;

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadRes.ok) {
      throw new Error(`S3 upload failed: ${uploadRes.statusText}`);
    }

    updateFileStatus(index, { progress: 100 });
    return key;
  };

  const uploadMultipart = async (
    file: File,
    metadata: VideoMetadata,
    index: number
  ): Promise<string> => {
    const chunkSize = 10 * 1024 * 1024; // 10MB
    const partsCount = Math.ceil(file.size / chunkSize);

    const { data: { key, uploadId, signedUrls } } = await getPresignedUrlsMultipart(
      file.name,
      file.type,
      partsCount
    );

    const parts: { PartNumber: number; ETag: string }[] = [];
    let uploadedCount = 0;

    const uploadPart = async (partNumber: number, url: string) => {
      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const res = await fetch(url, { method: "PUT", body: chunk });
      if (!res.ok) throw new Error(`Failed part ${partNumber}: ${res.statusText}`);

      const etag = res.headers.get("ETag");
      if (!etag) throw new Error(`Missing ETag for part ${partNumber}`);

      uploadedCount++;
      updateFileStatus(index, {
        progress: Math.round((uploadedCount / partsCount) * 100),
      });

      return { PartNumber: partNumber, ETag: etag.replace(/"/g, "") };
    };

    const limit = pLimit(CONCURRENCY);
    const uploadPromises = signedUrls.map(({ partNumber, url }: any) =>
      limit(() => uploadPart(partNumber, url))
    );

    const results = await Promise.all(uploadPromises);
    parts.push(...results);

    await completeMultipart(key, uploadId, parts);

    return key;
  };

  const handleUpload = async () => {
    if (!userId || selectedFiles.length === 0) {
      toast({
        title: "Cannot upload",
        description: "Please ensure you're logged in and have selected files",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const successfulUploads: UploadedVideo[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const { file, metadata, status } = selectedFiles[i];

      if (status === "success") continue;

      try {
        updateFileStatus(i, { status: "uploading", progress: 0 });

        let key: string;

        if (file.size > multipartThreshold) {
          console.log(`Using multipart upload for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          key = await uploadMultipart(file, metadata, i);
        } else {
          console.log(`Using simple upload for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          key = await uploadSimple(file, metadata, i);
        }

        const videoData = {
          originalFileName: file.name,
          s3InputKey: key,
          duration: metadata.duration,
          fileSize: file.size,
          resolution: `${metadata.width}x${metadata.height}`,
          mimeType: file.type,
          width: metadata.width,
          height: metadata.height,
          aspectRatio: metadata.aspectRatio,
        };

        const videoRecordResponse = await createVideoRecord(
          videoData.originalFileName,
          videoData.s3InputKey,
          videoData.duration,
          videoData.fileSize,
          videoData.resolution,
          videoData.mimeType
        );

        const videoId = videoRecordResponse.data?.data?.id;
        
        const updateVideoStatusResponse = await updateVideoStatus(videoId, "UPLOADED");
        if(!updateVideoStatusResponse) throw new Error("ERROR UPDATING VIDEO STATUS");

        const updatedVideo = {
          status: "success" as const,
          videoId,
          progress: 100,
          s3Key: key,
        };

        updateFileStatus(i, updatedVideo);

        successfulUploads.push({
          ...selectedFiles[i],
          ...updatedVideo,
        });

        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded successfully`,
        });
      } catch (err: any) {
        console.error("Upload error:", err);
        updateFileStatus(i, { 
          status: "error", 
          error: err.message || "Upload failed",
          progress: 0,
        });

        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}: ${err.message}`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);

    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads);
    }

    reset();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-5 w-5 text-green-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <File className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-20">
      <Card>
        <CardContent>
          <div className="w-full" {...getRootProps()}>
            <motion.div
              onClick={handleClick}
              whileHover="animate"
              className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
            >
              <input
                ref={fileInputRef}
                id="file-upload-handle"
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
                className="hidden"
                disabled={uploading}
              />
              <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
                <GridPattern />
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                  Upload Videos
                </p>
                <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                  Drag or drop your video files here or click to upload
                </p>
                <div className="relative w-full mt-10 max-w-xl mx-auto">
                  {selectedFiles.length > 0 &&
                    selectedFiles.map((video, idx) => (
                      <motion.div
                        key={"file" + idx}
                        layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                        className={cn(
                          "relative overflow-hidden z-40 flex flex-col items-start justify-start p-4 mt-4 w-full mx-auto rounded-md",
                          video.status === "success"
                            ? "bg-green-100/70 border border-green-300 dark:bg-green-950/40 dark:border-green-800"
                            : video.status === "error"
                            ? "bg-red-100/70 border border-red-300 dark:bg-red-950/40 dark:border-red-800"
                            : "bg-white dark:bg-neutral-900 shadow-sm"
                        )}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <StatusIcon status={video.status} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                layout
                                className="font-medium text-foreground truncate"
                              >
                                {video.file.name}
                              </motion.p>
                              {!uploading && video.status !== "uploading" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeVideo(idx);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {formatFileSize(video.file.size)}
                              </motion.span>
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <div className="flex items-center"><Clock size={12}/>: {video.metadata.duration.toFixed(1)}s</div>
                              </motion.span>
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {video.metadata.width}×{video.metadata.height}
                              </motion.span>
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                Aspect: {video.metadata.aspectRatio.toFixed(2)}
                              </motion.span>
                            </div>

                            {video.status === "uploading" && (
                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Uploading...</span>
                                  <span className="text-foreground font-medium">
                                    {video.progress}%
                                  </span>
                                </div>
                                <Progress value={video.progress} className="h-2" />
                              </div>
                            )}

                            {video.error && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-2 text-xs text-red-600 font-medium"
                              >
                                Error: {video.error}
                              </motion.div>
                            )}

                            {/* {video.status === "success" && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-2 text-xs text-green-600 font-medium"
                              >
                                Upload successful
                              </motion.div>
                            )} */}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  {!selectedFiles.length && (
                    <>
                      <motion.div
                        layoutId="file-upload"
                        variants={mainVariant}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className={cn(
                          "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                          "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                        )}
                      >
                        {isDragActive ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-neutral-600 flex flex-col items-center"
                          >
                            Drop it
                            <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                          </motion.p>
                        ) : (
                          <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                        )}
                      </motion.div>

                      <motion.div
                        variants={secondaryVariant}
                        className="absolute opacity-0 border border-dashed border-green-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                      ></motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {selectedFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.every((f) => f.status === "success")}
              className="w-full mt-6"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading {selectedFiles.filter((f) => f.status === "uploading").length} of{" "}
                  {selectedFiles.length}...
                </>
              ) : (
                `Upload ${
                  selectedFiles.filter((f) => f.status !== "success").length
                } Video${
                  selectedFiles.filter((f) => f.status !== "success").length !== 1 ? "s" : ""
                }`
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}