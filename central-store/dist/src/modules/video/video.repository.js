"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRespository = void 0;
const database_1 = require("../../config/database");
const enums_1 = require("../../generated/prisma/enums");
const error_1 = require("../../utils/error");
class VideoRespository {
    static instance;
    db = database_1.Database.getInstance();
    constructor() { }
    static getInstance() {
        if (!VideoRespository.instance) {
            VideoRespository.instance = new VideoRespository();
        }
        return VideoRespository.instance;
    }
    async findUsersVideoById(videoId, userId) {
        try {
            const videoResponse = await this.db.video.findUnique({
                where: {
                    userId,
                    id: videoId
                }
            });
            return videoResponse;
        }
        catch (err) {
            throw new error_1.NotFoundError("Requested video is unavailable");
        }
    }
    async findUserVideos(userId) {
        try {
            const videoResponse = await this.db.video.findMany({
                where: {
                    id: userId
                }
            });
            return videoResponse;
        }
        catch (err) {
            throw new error_1.NotFoundError("Not able to get user videos");
        }
    }
    async createVideoRecord(userId, originalFileName, s3InputKey, duration, size, resolution, format, thumbnailUrl, maxRetries = 5) {
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
                    status: enums_1.STATUS.NOT_UPLOADED,
                    maxRetries
                },
            });
            return videoCreationResult;
        }
        catch (err) {
            console.log("Error: ", err);
            throw new Error("Failed to create video record");
        }
    }
    async updateVideoRecordStatus(videoId, userId, status) {
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
            });
            return videoUpdationResult;
        }
        catch (err) {
            console.log("Error: ", err);
            throw new Error("Unable to update video record");
        }
    }
    async updateVideoRecordStatusWorker(videoId, status) {
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
            });
            return videoUpdationResult;
        }
        catch (err) {
            console.log("Error: ", err);
            throw new Error("Unable to update video record");
        }
    }
    async fetchVideosWithStatus(status, userId) {
        if (!userId) {
            throw new Error("User ID is required");
        }
        console.log("STATUS FROM ");
        if (status === "all") {
            const videoResponses = await this.db.video.findMany({
                where: {
                    userId: userId
                }
            });
            return videoResponses;
        }
        const videoResponses = await this.db.video.findMany({
            where: {
                status: status,
                userId: userId
            }
        });
        if (!videoResponses)
            throw new Error("No videos found");
        return videoResponses;
    }
}
exports.VideoRespository = VideoRespository;
//# sourceMappingURL=video.repository.js.map