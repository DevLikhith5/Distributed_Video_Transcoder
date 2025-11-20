import { Router } from "express"
import { UserController } from "./user.controller"

const router = Router();

router.get('/:id',UserController.getUser)
router.post('/sign-in',UserController.loginUser)
router.post('/sign-up',UserController.signupUser)

export default router;