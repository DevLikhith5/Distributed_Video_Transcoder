    import { NextFunction , Request, Response} from "express";
    import { auth } from "../lib/auth";
    import { fromNodeHeaders } from "better-auth/node";

    export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers),
            });
            if (!session) {
                return res.status(400).json({
                    message: "Authentication failed",
                });
            }
            req.user = session.user;
            req.session = session.session;
            next();
        } catch (err) {
            return res.status(500).json({
                message: "Authentication failed",
            });
        }
    };