import { Request, Response } from "express";
interface UserParams {
    id: string;
}
export declare class UserController {
    static getUser(req: Request<UserParams>, res: Response): Promise<void>;
    static loginUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static signupUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export {};
//# sourceMappingURL=user.controller.d.ts.map