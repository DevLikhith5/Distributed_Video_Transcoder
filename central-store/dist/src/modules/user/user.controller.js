"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const userService = user_service_1.UserService.getInstance();
class UserController {
    static async getUser(req, res) {
        const user = await userService.getUser(req.params?.id);
        res.json(user);
    }
    static async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userService.loginUser(email, password);
            return res.json(user);
        }
        catch (err) {
            return res.status(401).json({ error: err.message });
        }
    }
    static async signupUser(req, res) {
        try {
            const { email, password, name } = req.body;
            const user = await userService.registerUser(email, password, name);
            return res.json(user);
        }
        catch (err) {
            return res.status(401).json({ error: err.message });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map