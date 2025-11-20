"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const auth_1 = require("../lib/auth");
const node_1 = require("better-auth/node");
const authMiddleware = async (req, res, next) => {
    try {
        const session = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        if (!session) {
            return res.status(400).json({
                message: "Authentication failed",
            });
        }
        req.user = session.user;
        req.session = session.session;
        next();
    }
    catch (err) {
        return res.status(500).json({
            message: "Authentication failed",
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map