import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { config as envConfig } from "../config/config";


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
  signedUrls: Array<{ partNumber: number; url: string }>;
}

export class S3Service {
  s3Client: S3Client;
  bucketName: string;
  region: string;

  constructor(config: S3Config) {
    this.region = config.region;
    this.bucketName = config.bucketName;

    this.s3Client = new S3Client({
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
  generateFileKey(fileName: string, userId: string): string {
    const fileExtension = fileName.split(".").pop() || "bin";
    const timestamp = Date.now();
    const uuid = randomUUID();

    return `uploads/${timestamp}-${uuid}-${userId}.${fileExtension}`;
  }

  /**
   * Gets a presigned URL for direct client-side upload
   * Used for: Small to medium files (< 100MB)
   */
  async getPresignedUploadUrl(
    fileName: string,
    fileType: string,
    userId: string,
    expiresIn: number = 360
  ): Promise<PresignedUrlResponse> {
    const key = this.generateFileKey(fileName, userId);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

    console.log(`Generated presigned upload URL for key: ${key}`);
    return { uploadUrl, key };
  }

  /**
   * Gets a presigned URL for downloading/viewing a file
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = 3000): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

    console.log(`Generated presigned download URL for key: ${key}`);
    return downloadUrl;
  }

  /**
   * Initiates multipart upload and generates presigned URLs for each part
   * Used for: Large files (> 100MB)
   */
  async initiateMultipartUpload(
    fileName: string,
    fileType: string,
    partsCount: number,
    userId: string
  ): Promise<MultipartUploadResponse> {
    const key = this.generateFileKey(fileName, userId);

    const createResp = await this.s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: fileType,
      })
    );

    const uploadId = createResp.UploadId;
    if (!uploadId) throw new Error("Failed to initiate multipart upload - no UploadId received");

    const signedUrls = await Promise.all(
      Array.from({ length: partsCount }, (_, i) => i + 1).map(async (partNumber) => {
        const command = new UploadPartCommand({
          Bucket: this.bucketName,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        return { partNumber, url };
      })
    );

    console.log(`Initiated multipart upload for ${key} with ${partsCount} parts`);
    return { key, uploadId, signedUrls };
  }

  /**
   * Completes a multipart upload after all parts are uploaded
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: MultipartPart[]
  ): Promise<string> {
    const validParts = parts.map((part) => {
      if (!part.ETag) throw new Error(`ETag missing for part ${part.PartNumber}`);
      return { PartNumber: part.PartNumber, ETag: part.ETag };
    });

    const completeResp = await this.s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: validParts },
      })
    );

    console.log(`Completed multipart upload for key: ${key}`);
    return completeResp.Location || `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Uploads a file directly from the server to S3
   */
  async uploadFile(key: string, body: Buffer | Uint8Array | Blob | string, contentType: string): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    console.log(`Uploaded file to S3: ${key}`);
    return key;
  }
}

/**
 * Singleton instance creator
 */
let s3ServiceInstance: S3Service | null = null;

export function getS3Service(): S3Service {
  if (!s3ServiceInstance) {
    s3ServiceInstance = new S3Service({
      region: envConfig.s3.region,
      bucketName: envConfig.s3.bucket,
      accessKeyId: envConfig.s3.accessKey,
      secretAccessKey: envConfig.s3.secretKey,
    });
  }
  return s3ServiceInstance;
}
