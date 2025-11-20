"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const auth_1 = require("../../lib/auth");
const user_repository_1 = require("./user.repository");
class UserService {
    static instance;
    userRepository = user_repository_1.UserRepository.getInstance();
    constructor() { }
    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
    async getUser(id) {
        try {
            const user = await this.userRepository.findById(id);
            return user;
        }
        catch (err) {
            throw err;
        }
    }
    async loginUser(email, password) {
        const user = await auth_1.auth.api.signInEmail({
            body: {
                email,
                password,
                rememberMe: true,
                callbackURL: '/dashboard'
            }
        });
        return user;
    }
    async registerUser(email, password, name) {
        const user = await auth_1.auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                rememberMe: true,
                callbackURL: '/sign-in'
            }
        });
        return user;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map