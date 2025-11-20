import { Database } from "../../config/database";
import { STATUS } from "../../generated/prisma/enums";
import { NotFoundError } from "../../utils/error";

export class VideoRespository {
    private static instance: VideoRespository;
    private db = Database.getInstance();

    private constructor() { }

    public static getInstance(): VideoRespository {
        if (!VideoRespository.instance) {
            VideoRespository.instance = new VideoRespository();
        }
        return VideoRespository.instance;
    }
    async findUsersVideoById(videoId: string, userId: string) {
        try {
            const videoResponse = await this.db.video.findUnique({
                where: {
                    userId,
                    id: videoId
                }
            })

            return videoResponse
        } catch (err) {
            throw new NotFoundError("Requested video is unavailable")
        }
    }

    async findUserVideos(userId: string) {
        try {
            const videoResponse = await this.db.video.findMany({
                where: {
                    id: userId
                }
            })
            return videoResponse
        } catch (err) {
            throw new NotFoundError("Not able to get user videos")
        }
    }

    async createVideoRecord(userId: string, originalFileName: string,
        s3InputKey: string, duration?: number, size?: number, resolution?: string,
        format?: string, thumbnailUrl?: string, maxRetries = 5
    ) {
        try {
            const videoCreationResult = await this.db.video.create({
                data: {
                    userId,
                    originalFileName,
                    s3InputKey,
                    duration,
                    size,
                    resolution,
                    format,
                    thumbnailUrl,
                    status: STATUS.NOT_UPLOADED,
                    maxRetries
                },

            });
            return videoCreationResult
        } catch (err) {
            console.log("Error: ", err)
            throw new Error("Failed to create video record")
        }
    }

    async updateVideoRecordStatus(videoId: string, userId: string, status: STATUS) {
        try {
            console.log("VIDEOID: ", videoId);
            console.log("USERID: ", userId);
            console.log("STATUS: ", status);
            const videoUpdationResult = await this.db.video.update({
                where: {
                    id: userId,
                    userId: videoId
                },
                data: {
                    status
                }
            })
            return videoUpdationResult;
        } catch (err) {
            console.log("Error: ", err)
            throw new Error("Unable to update video record")
        }
    }
        async updateVideoRecordStatusWorker(videoId: string, status: STATUS) {
        try {
            console.log("VIDEOID: ", videoId);
            console.log("STATUS: ", status);
            const videoUpdationResult = await this.db.video.update({
                where: {
                    s3InputKey: videoId,
                },
                data: {
                    status
                }
            })
            return videoUpdationResult;
        } catch (err) {
            console.log("Error: ", err)
            throw new Error("Unable to update video record")
        }
    }

    async fetchVideosWithStatus(status: string, userId: string) {
        if (!userId) {
            throw new Error("User ID is required")
        }
        console.log("STATUS FROM ")
        if (status === "all") {
            const videoResponses = await this.db.video.findMany({
                where: {
                    userId: userId
                }
            })
            return videoResponses
        }
        const videoResponses = await this.db.video.findMany({
            where: {
                status: status as STATUS,
                userId: userId
            }
        })

        if (!videoResponses) throw new Error("No videos found")
        return videoResponses

    }





} 