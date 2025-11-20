import express from "express"
import userRoutes from "./modules/user/user.route"
import videoRoutes from "./modules/video/video.route"
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors"
const app = express();
app.use(express.json())
app.use(
    cors({
        origin: "http://localhost:5173", 
        methods: ["GET", "POST", "PUT", "DELETE","PATCH"], 
        credentials: true, 
    })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/api/me", async (req, res) => {
    const session = await auth.api.getSession({
     headers: fromNodeHeaders(req.headers),
   });
   return res.json(session);
});

app.use(express.json());
app.use('/user',userRoutes)
app.use('/video',videoRoutes)

export default app;