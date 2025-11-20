import { Request, Response } from "express"

import { UserService } from "./user.service"

const userService = UserService.getInstance();
interface UserParams {
    id:string
}

export class UserController {
        static async getUser(req:Request<UserParams>, res:Response) {
            const user = await userService.getUser(req.params?.id as string);
            res.json(user)
        }
    static async loginUser(req:Request, res:Response) {
        try {
            const { email, password } = req.body;
            const user = await userService.loginUser(email,password)
            return res.json(user)
        }catch(err:any){
            return res.status(401).json({ error: err.message });
        }
    }

    static async signupUser(req:Request, res:Response) {
        try {
            const { email, password,name } = req.body;
            const user = await userService.registerUser(email,password,name)
            return res.json(user)
        }catch(err:any){
            return res.status(401).json({ error: err.message });
        }
    }
}