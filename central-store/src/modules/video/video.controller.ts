import { json, Request, Response } from "express";
import { VideoService } from "./video.service";
import { AuthError } from "../../utils/error";
import { STATUS } from "../../generated/prisma/enums";

const videoService = VideoService.getInstance();

export class VideoController {
  /**
   * Handles single video upload request.
   * Client calls this → gets a presigned URL → uploads directly to S3.
   */
  static async uploadVideoSingle(req: Request, res: Response) {
    try {
      const userId = req.user?.id; 
      if (!userId) throw new AuthError("User not authenticated");
      const { fileName, fileType } = req.query;

      if (!fileName || !fileType) {
        return res.status(400).json({ message: "fileName and fileType are required" });
      }

      const uploadData = await videoService.uploadVideoSingle(fileName as string, fileType as string, userId);

      return res.status(200).json({
        message: "Presigned upload URL generated successfully",
        data: uploadData, 
      });
    } catch (err: any) {
      console.error("Error in uploadVideoSingle:", err);

      if (err instanceof AuthError) {
        return res.status(401).json({ message: err.message || "Unauthorized" });
      }

      return res.status(500).json({
        message: "Failed to generate upload URL",
        error: err.message || "Internal Server Error",
      });
    }
  }
  static async uploadVideoMultipart(req:Request,res:Response){
    try{
        const userId = req.user?.id;
        if (!userId) throw new AuthError("User not authenticated");
        const { fileName, fileType,partsCount } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({ message: "fileName and fileType are required" });
        }

        const uploadData = await videoService.initiateMultipartUpload(fileName, fileType,partsCount ,userId);
        return res.status(200).json(uploadData);



    }catch (err) {
        if (err instanceof Error) {
          return res.status(500).json({
            message: "Failed to generate upload URL",
            error: err.message,
          });
        }
      
        return res.status(500).json({
          message: "Failed to generate upload URL",
          error: "Internal Server Error",
        });
      }
  }
  static async completeVideoMultipart(req: Request, res: Response) {
    try {
      const { key, uploadId, parts } = req.body;
  
      if (!key || !uploadId || !parts) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // Call the service layer to complete multipart upload on S3
      const completionResponse = await videoService.completeMultipartUpload(
        key,
        uploadId,
        parts
      );
  

      return res.status(200).json({
        message: "Multipart upload completed successfully",
        data: completionResponse,
      });
    } catch (err: any) {
      console.error("Error completing multipart upload:", err);
      return res.status(500).json({
        message: "Failed to complete multipart upload",
        error: err.message || err,
      });
    }
  }
  static async createVideoRecord(req: Request, res: Response) {
    try {
      const userId = req.user?.id; 
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const {
        originalFileName,
        s3InputKey,
        duration,
        size,
        resolution,
        format,
      } = req.body;
      
      if (!originalFileName || !s3InputKey) {
        return res.status(400).json({
          message: "Missing required fields: originalFileName or s3InputKey",
        });
      }
  
      const video = await videoService.createVideoRecord(
        userId,
        originalFileName,
        s3InputKey,
        duration,
        size,
        resolution,
        format
      );
  
      return res.status(201).json({
        message: "Video record created successfully",
        data: video,
      });
    } catch (err: any) {
      console.error("Error creating video record:", err);
      return res.status(500).json({
        message: "Failed to create video record",
        error: err.message || err,
      });
    }
  }
  static async updateVideoStatus(req: Request, res:Response) {
    try{
      const userId = req.user?.id;
      if (!userId) throw new AuthError("User not authenticated");
      const {videoId,status} = req.body;
      
      if (!videoId || !status) {
        return res.status(400).json({message: "Missing required fields: videoId or status"});
      }

      const updatedVideo = await videoService.updateVideoStatus(userId,videoId,status);
      
      return res.status(200).json({
        message: "Video status updated successfully",
        data: updatedVideo,
      });
      
    }catch(err){
      return res.status(500).json({
        message: "Failed to update video status",
        error: err
      });
    }
  }
  static async fetchVideoWithStatus(req: Request, res:Response){
    try{
      const  { status } = req.query
      const userId = req.user?.id;
      if(!userId){
        return res.status(401).json({message: "User not authenticated"});
      }
      if(!status){
        return res.status(400).json({message: "Missing required fields: status"});
      }
      console.log("STATUS: ",status)
      const fetchedVideoData  = await videoService.fetchVideoWithStatus(status  as STATUS,userId)
      console.log("Fetcehd Video Data:" ,fetchedVideoData)
      return res.status(200).json({
        message:"Video fetched successfully",
        data:fetchedVideoData
      })
    }catch(err){
      return res.status(500).json({
        message:"Failed to fetch the video data",
        error:err
      })
    }
  }
  

  
  /**
   * Handles generating a presigned download URL
   */
  static async getVideoDownloadUrl(req: Request, res: Response) {
    try {
      const { key } = req.query;
      if (!key || typeof key !== "string") {
        return res.status(400).json({ message: "Video key is required" });
      }

      const downloadData = await videoService.getVideoDownloadUrl(key);

      return res.status(200).json({
        message: "Presigned download URL generated successfully",
        data: downloadData, 
      });
    } catch (err: any) {
      console.error("Error in getVideoDownloadUrl:", err);

      return res.status(500).json({
        message: "Failed to generate download URL",
        error: err.message || "Internal Server Error",
      });
    }
  }

  /**
   * 
    For the workers
   */

    static async updateVideoStatusForWorker(req: Request,res:Response) {
    try{
      const {videoId,status} = req.body;
      
      if (!videoId || !status) {
        return res.status(400).json({message: "Missing required fields: videoId or status"});
      }

      const updatedVideo = await videoService.updateVideoStatusForWorker(videoId,status);

      console.log("UPDa")
      
      return res.status(200).json({
        message: "Video status updated successfully",
        data: updatedVideo,
      });
      
    }catch(err){
      return res.status(500).json({
        message: "Failed to update video status",
        error: err
      });
    }
    }
}
