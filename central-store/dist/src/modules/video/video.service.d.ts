import { STATUS } from "../../generated/prisma/enums";
export declare class VideoService {
    private static instance;
    private s3Service;
    private videoRepository;
    private constructor();
    static getInstance(): VideoService;
    /**
     * Get a presigned URL for single-part (direct) upload
     */
    uploadVideoSingle(fileName: string, fileType: string, userId: string, expires?: number): Promise<import("../../lib/s3").PresignedUrlResponse>;
    /**
     * Get a presigned URL for downloading / streaming
     */
    getVideoDownloadUrl(key: string, expires?: number): Promise<{
        downloadUrl: string;
    }>;
    /**
     * Initiate multipart upload for large files
     */
    initiateMultipartUpload(fileName: string, fileType: string, partsCount: number, userId: string): Promise<import("../../lib/s3").MultipartUploadResponse>;
    /**
     * Complete multipart upload after all parts are uploaded
     */
    completeMultipartUpload(key: string, uploadId: string, parts: Array<{
        PartNumber: number;
        ETag: string;
    }>): Promise<{
        finalUrl: string;
    }>;
    createVideoRecord(userId: string, originalFileName: string, s3InputKey: string, duration?: number, size?: number, resolution?: string, format?: string, maxRetries?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        duration: number | null;
        userId: string;
        s3InputKey: string;
        s3OutputKey: string | null;
        originalFileName: string;
        size: number | null;
        resolution: string | null;
        format: string | null;
        thumbnailUrl: string | null;
        status: STATUS;
        errorMessage: string | null;
        ecsTaskId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        maxRetries: number | null;
        currRetries: number;
    }>;
    updateVideoStatus(userId: string, videoId: string, status: STATUS): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        duration: number | null;
        userId: string;
        s3InputKey: string;
        s3OutputKey: string | null;
        originalFileName: string;
        size: number | null;
        resolution: string | null;
        format: string | null;
        thumbnailUrl: string | null;
        status: STATUS;
        errorMessage: string | null;
        ecsTaskId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        maxRetries: number | null;
        currRetries: number;
    }>;
    updateVideoStatusForWorker(videoId: string, status: STATUS): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        duration: number | null;
        userId: string;
        s3InputKey: string;
        s3OutputKey: string | null;
        originalFileName: string;
        size: number | null;
        resolution: string | null;
        format: string | null;
        thumbnailUrl: string | null;
        status: STATUS;
        errorMessage: string | null;
        ecsTaskId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        maxRetries: number | null;
        currRetries: number;
    }>;
    fetchVideoWithStatus(status: STATUS, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        duration: number | null;
        userId: string;
        s3InputKey: string;
        s3OutputKey: string | null;
        originalFileName: string;
        size: number | null;
        resolution: string | null;
        format: string | null;
        thumbnailUrl: string | null;
        status: STATUS;
        errorMessage: string | null;
        ecsTaskId: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        maxRetries: number | null;
        currRetries: number;
    }[]>;
    /**
     * Generates a thumbnail for a video stored in S3
     */
    generateThumbnail(s3Key: string, userId: string): Promise<string | undefined>;
}
//# sourceMappingURL=video.service.d.ts.map