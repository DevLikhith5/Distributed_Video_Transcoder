"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const video_controller_1 = require("./video.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/get-presigned-single', auth_middleware_1.authMiddleware, video_controller_1.VideoController.uploadVideoSingle);
router.post('/get-presigned-multipart', auth_middleware_1.authMiddleware, video_controller_1.VideoController.uploadVideoMultipart);
router.post('/complete-multipart', auth_middleware_1.authMiddleware, video_controller_1.VideoController.completeVideoMultipart);
router.post('/create-videorecord', auth_middleware_1.authMiddleware, video_controller_1.VideoController.createVideoRecord);
router.patch('/update-video-status', auth_middleware_1.authMiddleware, video_controller_1.VideoController.updateVideoStatus);
router.patch('/update-video-status-worker', video_controller_1.VideoController.updateVideoStatusForWorker);
router.get('/', auth_middleware_1.authMiddleware, video_controller_1.VideoController.fetchVideoWithStatus);
exports.default = router;
//# sourceMappingURL=video.route.js.map