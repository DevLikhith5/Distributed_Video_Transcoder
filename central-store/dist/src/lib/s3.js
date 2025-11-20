"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
exports.getS3Service = getS3Service;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
const config_1 = require("../config/config");
class S3Service {
    s3Client;
    bucketName;
    region;
    constructor(config) {
        this.region = config.region;
        this.bucketName = config.bucketName;
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
        console.log(`S3Service initialized → Region: ${this.region}, Bucket: ${this.bucketName}`);
    }
    /**
     * Generates a unique S3 key for file storage
     * Format: uploads/{timestamp}-{uuid}-{userId}.{extension}
     */
    generateFileKey(fileName, userId) {
        const fileExtension = fileName.split(".").pop() || "bin";
        const timestamp = Date.now();
        const uuid = (0, crypto_1.randomUUID)();
        return `uploads/${timestamp}-${uuid}-${userId}.${fileExtension}`;
    }
    /**
     * Gets a presigned URL for direct client-side upload
     * Used for: Small to medium files (< 100MB)
     */
    async getPresignedUploadUrl(fileName, fileType, userId, expiresIn = 360) {
        const key = this.generateFileKey(fileName, userId);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: fileType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        console.log(`Generated presigned upload URL for key: ${key}`);
        return { uploadUrl, key };
    }
    /**
     * Gets a presigned URL for downloading/viewing a file
     */
    async getPresignedDownloadUrl(key, expiresIn = 3000) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        console.log(`Generated presigned download URL for key: ${key}`);
        return downloadUrl;
    }
    /**
     * Initiates multipart upload and generates presigned URLs for each part
     * Used for: Large files (> 100MB)
     */
    async initiateMultipartUpload(fileName, fileType, partsCount, userId) {
        const key = this.generateFileKey(fileName, userId);
        const createResp = await this.s3Client.send(new client_s3_1.CreateMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: fileType,
        }));
        const uploadId = createResp.UploadId;
        if (!uploadId)
            throw new Error("Failed to initiate multipart upload - no UploadId received");
        const signedUrls = await Promise.all(Array.from({ length: partsCount }, (_, i) => i + 1).map(async (partNumber) => {
            const command = new client_s3_1.UploadPartCommand({
                Bucket: this.bucketName,
                Key: key,
                UploadId: uploadId,
                PartNumber: partNumber,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 3600 });
            return { partNumber, url };
        }));
        console.log(`Initiated multipart upload for ${key} with ${partsCount} parts`);
        return { key, uploadId, signedUrls };
    }
    /**
     * Completes a multipart upload after all parts are uploaded
     */
    async completeMultipartUpload(key, uploadId, parts) {
        const validParts = parts.map((part) => {
            if (!part.ETag)
                throw new Error(`ETag missing for part ${part.PartNumber}`);
            return { PartNumber: part.PartNumber, ETag: part.ETag };
        });
        const completeResp = await this.s3Client.send(new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: { Parts: validParts },
        }));
        console.log(`Completed multipart upload for key: ${key}`);
        return completeResp.Location || `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }
    /**
     * Uploads a file directly from the server to S3
     */
    async uploadFile(key, body, contentType) {
        await this.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        }));
        console.log(`Uploaded file to S3: ${key}`);
        return key;
    }
}
exports.S3Service = S3Service;
/**
 * Singleton instance creator
 */
let s3ServiceInstance = null;
function getS3Service() {
    if (!s3ServiceInstance) {
        s3ServiceInstance = new S3Service({
            region: config_1.config.s3.region,
            bucketName: config_1.config.s3.bucket,
            accessKeyId: config_1.config.s3.accessKey,
            secretAccessKey: config_1.config.s3.secretKey,
        });
    }
    return s3ServiceInstance;
}
//# sourceMappingURL=s3.js.map