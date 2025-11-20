"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("../../config/database");
const error_1 = require("../../utils/error");
class UserRepository {
    static instance;
    db = database_1.Database.getInstance();
    constructor() { }
    static getInstance() {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }
    async findById(id) {
        try {
            const user = await this.db.user.findUnique({ where: { id } });
            if (!user)
                throw new error_1.NotFoundError("User not found");
            return user;
        }
        catch (err) {
            throw new error_1.DatabaseError("Database query failed", err);
        }
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map