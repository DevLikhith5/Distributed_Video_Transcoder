"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config/config");
const database_1 = require("./config/database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = Number(config_1.config.port) || 3000;
async function startServer() {
    try {
        const db = database_1.Database.getInstance();
        await db.$connect();
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map