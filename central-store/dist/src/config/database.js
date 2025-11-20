"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const client_1 = require("../generated/prisma/client");
class Database {
    static instance;
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new client_1.PrismaClient();
        }
        return Database.instance;
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map