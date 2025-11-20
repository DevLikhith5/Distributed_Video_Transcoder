"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const database_1 = require("../config/database");
const plugins_1 = require("better-auth/plugins");
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("../config/config");
dotenv_1.default.config();
const prisma = database_1.Database.getInstance();
exports.auth = (0, better_auth_1.betterAuth)({
    plugins: [(0, plugins_1.bearer)(), (0, plugins_1.openAPI)()],
    trustedOrigins: ["http://localhost:5173"],
    database: (0, prisma_1.prismaAdapter)(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: config_1.config.google.clientId,
            clientSecret: config_1.config.google.clientSecret,
        },
        github: {
            clientId: config_1.config.github.clientId,
            clientSecret: config_1.config.github.clientSecret,
        }
    },
});
//# sourceMappingURL=auth.js.map