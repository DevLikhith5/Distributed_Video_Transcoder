"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const s3_1 = require("../../lib/s3");
const video_repository_1 = require("./video.repository");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
class VideoService {
    static instance;
    s3Service = (0, s3_1.getS3Service)();
    videoRepository = video_repository_1.VideoRespository.getInstance();
    constructor() { }
    static getInstance() {
        if (!VideoService.instance) {
            VideoService.instance = new VideoService();
        }
        return VideoService.instance;
    }
    /**
     * Get a presigned URL for single-part (direct) upload
     */
    async uploadVideoSingle(fileName, fileType, userId, expires = 360) {
        try {
            const uploadVideoResponse = await this.s3Service.getPresignedUploadUrl(fileName, fileType, userId, expires);
            const { key } = uploadVideoResponse;
            // await this.videoRepository.createVideoRecord(userId,fileName,key)
            return uploadVideoResponse;
        }
        catch (err) {
            console.error("🔥 Prisma error creating video record:", err);
            throw new Error(`Error uploading vidoe ${err}`);
        }
    }
    /**
     * Get a presigned URL for downloading / streaming
     */
    async getVideoDownloadUrl(key, expires = 3000) {
        const downloadUrl = await this.s3Service.getPresignedDownloadUrl(key, expires);
        return { downloadUrl };
    }
    /**
     * Initiate multipart upload for large files
     */
    async initiateMultipartUpload(fileName, fileType, partsCount, userId) {
        const multipartResponse = await this.s3Service.initiateMultipartUpload(fileName, fileType, partsCount, userId);
        return multipartResponse;
    }
    /**
     * Complete multipart upload after all parts are uploaded
     */
    async completeMultipartUpload(key, uploadId, parts) {
        const finalUrl = await this.s3Service.completeMultipartUpload(key, uploadId, parts);
        return { finalUrl };
    }
    async createVideoRecord(userId, originalFileName, s3InputKey, duration, size, resolution, format, maxRetries = 5) {
        try {
            let thumbnailUrl;
            // Attempt to generate thumbnail before creating the record
            if (s3InputKey) {
                thumbnailUrl = await this.generateThumbnail(s3InputKey, userId);
            }
            const video = await this.videoRepository.createVideoRecord(userId, originalFileName, s3InputKey, duration, size, resolution, format, thumbnailUrl, maxRetries);
            return video;
        }
        catch (err) {
            if (err instanceof Error) {
                console.error("Failed to create video record:", err.message);
                throw new Error(err.message);
            }
            console.error("Unknown error while creating video record:", err);
            throw new Error("Failed to create video record");
        }
    }
    async updateVideoStatus(userId, videoId, status) {
        try {
            return await this.videoRepository.updateVideoRecordStatus(userId, videoId, status);
        }
        catch (err) {
            throw err;
        }
    }
    async updateVideoStatusForWorker(videoId, status) {
        try {
            return await this.videoRepository.updateVideoRecordStatusWorker(videoId, status);
        }
        catch (err) {
            throw err;
        }
    }
    async fetchVideoWithStatus(status, userId) {
        try {
            const resp = await this.videoRepository.fetchVideosWithStatus(status, userId);
            console.log("resp from service: ", resp);
            return resp;
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Generates a thumbnail for a video stored in S3
     */
    async generateThumbnail(s3Key, userId) {
        try {
            console.log(`Generating thumbnail for video: ${s3Key}`);
            const videoUrl = await this.s3Service.getPresignedDownloadUrl(s3Key, 300);
            const tempDir = os_1.default.tmpdir();
            const thumbnailFileName = `thumb-${path_1.default.basename(s3Key, path_1.default.extname(s3Key))}.jpg`;
            const tempFilePath = path_1.default.join(tempDir, thumbnailFileName);
            await new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(videoUrl)
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
            const fileBuffer = fs_1.default.readFileSync(tempFilePath);
            await this.s3Service.uploadFile(thumbnailKey, fileBuffer, "image/jpeg");
            fs_1.default.unlinkSync(tempFilePath);
            console.log(`Thumbnail generated and uploaded: ${thumbnailKey}`);
            return thumbnailKey;
        }
        catch (err) {
            console.error("Failed to generate thumbnail:", err);
            return undefined;
        }
    }
}
exports.VideoService = VideoService;
//# sourceMappingURL=video.service.js.map