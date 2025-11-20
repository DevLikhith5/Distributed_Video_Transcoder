import { Request, Response } from "express";
export declare class VideoController {
    /**
     * Handles single video upload request.
     * Client calls this → gets a presigned URL → uploads directly to S3.
     */
    static uploadVideoSingle(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static uploadVideoMultipart(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static completeVideoMultipart(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createVideoRecord(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateVideoStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static fetchVideoWithStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Handles generating a presigned download URL
     */
    static getVideoDownloadUrl(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     *
      For the workers
     */
    static updateVideoStatusForWorker(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=video.controller.d.ts.map