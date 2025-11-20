import { Router } from "express"
import { VideoController } from "./video.controller";
import { authMiddleware } from "../../middleware/auth.middleware";


const router = Router();

router.get('/get-presigned-single',authMiddleware,VideoController.uploadVideoSingle)
router.post('/get-presigned-multipart',authMiddleware,VideoController.uploadVideoMultipart)
router.post('/complete-multipart',authMiddleware,VideoController.completeVideoMultipart)
router.post('/create-videorecord',authMiddleware,VideoController.createVideoRecord)
router.patch('/update-video-status',authMiddleware,VideoController.updateVideoStatus)
router.patch('/update-video-status-worker',VideoController.updateVideoStatusForWorker)
router.get('/',authMiddleware,VideoController.fetchVideoWithStatus)

export default router;