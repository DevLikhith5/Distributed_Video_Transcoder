import { S3Client } from "@aws-sdk/client-s3";
export interface S3Config {
    region: string;
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
}
export interface MultipartPart {
    PartNumber: number;
    ETag: string;
}
export interface PresignedUrlResponse {
    uploadUrl: string;
    key: string;
}
export interface MultipartUploadResponse {
    key: string;
    uploadId: string;
    signedUrls: Array<{
        partNumber: number;
        url: string;
    }>;
}
export declare class S3Service {
    s3Client: S3Client;
    bucketName: string;
    region: string;
    constructor(config: S3Config);
    /**
     * Generates a unique S3 key for file storage
     * Format: uploads/{timestamp}-{uuid}-{userId}.{extension}
     */
    generateFileKey(fileName: string, userId: string): string;
    /**
     * Gets a presigned URL for direct client-side upload
     * Used for: Small to medium files (< 100MB)
     */
    getPresignedUploadUrl(fileName: string, fileType: string, userId: string, expiresIn?: number): Promise<PresignedUrlResponse>;
    /**
     * Gets a presigned URL for downloading/viewing a file
     */
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    /**
     * Initiates multipart upload and generates presigned URLs for each part
     * Used for: Large files (> 100MB)
     */
    initiateMultipartUpload(fileName: string, fileType: string, partsCount: number, userId: string): Promise<MultipartUploadResponse>;
    /**
     * Completes a multipart upload after all parts are uploaded
     */
    completeMultipartUpload(key: string, uploadId: string, parts: MultipartPart[]): Promise<string>;
    /**
     * Uploads a file directly from the server to S3
     */
    uploadFile(key: string, body: Buffer | Uint8Array | Blob | string, contentType: string): Promise<string>;
}
export declare function getS3Service(): S3Service;
//# sourceMappingURL=s3.d.ts.map