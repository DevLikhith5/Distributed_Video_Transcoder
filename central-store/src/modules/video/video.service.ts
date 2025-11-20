import { STATUS } from "../../generated/prisma/enums";
import { getS3Service } from "../../lib/s3";
import { VideoRespository } from "./video.repository";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";

export class VideoService {
  private static instance: VideoService;
  private s3Service = getS3Service();
  private videoRepository = VideoRespository.getInstance()
  private constructor() { }

  public static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  /**
   * Get a presigned URL for single-part (direct) upload
   */
  async uploadVideoSingle(
    fileName: string,
    fileType: string,
    userId: string,
    expires: number = 360
  ) {
    try {
      const uploadVideoResponse = await this.s3Service.getPresignedUploadUrl(
        fileName,
        fileType,
        userId,
        expires,
      );
      const { key } = uploadVideoResponse

      // await this.videoRepository.createVideoRecord(userId,fileName,key)
      return uploadVideoResponse;



    } catch (err) {
      console.error("🔥 Prisma error creating video record:", err);
      throw new Error(`Error uploading vidoe ${err}`)
    }

  }

  /**
   * Get a presigned URL for downloading / streaming
   */
  async getVideoDownloadUrl(key: string, expires: number = 3000) {
    const downloadUrl = await this.s3Service.getPresignedDownloadUrl(key, expires);
    return { downloadUrl };
  }



  /**
   * Initiate multipart upload for large files
   */
  async initiateMultipartUpload(
    fileName: string,
    fileType: string,
    partsCount: number,
    userId: string
  ) {
    const multipartResponse = await this.s3Service.initiateMultipartUpload(
      fileName,
      fileType,
      partsCount,
      userId
    );

    return multipartResponse;
  }

  /**
   * Complete multipart upload after all parts are uploaded
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Array<{ PartNumber: number; ETag: string }>
  ) {
    const finalUrl = await this.s3Service.completeMultipartUpload(key, uploadId, parts);
    return { finalUrl };
  }
  async createVideoRecord(
    userId: string,
    originalFileName: string,
    s3InputKey: string,
    duration?: number,
    size?: number,
    resolution?: string,
    format?: string,
    maxRetries = 5
  ) {
    try {
      let thumbnailUrl: string | undefined;

      // Attempt to generate thumbnail before creating the record
      if (s3InputKey) {
        thumbnailUrl = await this.generateThumbnail(s3InputKey, userId);
      }

      const video = await this.videoRepository.createVideoRecord(
        userId,
        originalFileName,
        s3InputKey,
        duration,
        size,
        resolution,
        format,
        thumbnailUrl,
        maxRetries
      );

      return video;
    } catch (err) {
      if (err instanceof Error) {
        console.error("Failed to create video record:", err.message);
        throw new Error(err.message);
      }
      console.error("Unknown error while creating video record:", err);
      throw new Error("Failed to create video record");
    }
  }

  async updateVideoStatus(
    userId: string,
    videoId: string,
    status: STATUS

  ) {
    try {
      return await this.videoRepository.updateVideoRecordStatus(userId, videoId, status);
    } catch (err) {
      throw err
    }
  }
    async updateVideoStatusForWorker(
    videoId: string,
    status: STATUS

  ) {
    try {
      return await this.videoRepository.updateVideoRecordStatusWorker( videoId, status);
    } catch (err) {
      throw err
    }
  }

  async fetchVideoWithStatus(status: STATUS, userId: string) {
    try {
      const resp = await this.videoRepository.fetchVideosWithStatus(status, userId)
      console.log("resp from service: ", resp);
      return resp
    } catch (err) {
      throw err
    }
  }
  /**
   * Generates a thumbnail for a video stored in S3
   */
  async generateThumbnail(s3Key: string, userId: string): Promise<string | undefined> {
    try {
      console.log(`Generating thumbnail for video: ${s3Key}`);


      const videoUrl = await this.s3Service.getPresignedDownloadUrl(s3Key, 300); 


      const tempDir = os.tmpdir();
      const thumbnailFileName = `thumb-${path.basename(s3Key, path.extname(s3Key))}.jpg`;
      const tempFilePath = path.join(tempDir, thumbnailFileName);


      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoUrl)
          .screenshots({
            count: 1,
            folder: tempDir,
            filename: thumbnailFileName,
            size: "1080x?", 
          })
          .on("end", () => resolve())
          .on("error", (err) => reject(err));
      });


      const thumbnailKey = `thumbnails/${userId}/${thumbnailFileName}`;
      const fileBuffer = fs.readFileSync(tempFilePath);

      await this.s3Service.uploadFile(thumbnailKey, fileBuffer, "image/jpeg");


      fs.unlinkSync(tempFilePath);

      console.log(`Thumbnail generated and uploaded: ${thumbnailKey}`);
      return thumbnailKey;

    } catch (err) {
      console.error("Failed to generate thumbnail:", err);
      return undefined;
    }
  }
}

