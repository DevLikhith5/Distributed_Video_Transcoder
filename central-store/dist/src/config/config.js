"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    BETTER_AUTH_SECRET: zod_1.z.string().min(10),
    PORT: zod_1.z.string().default("8080"),
    GOOGLE_CLIENT_ID: zod_1.z.string(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string(),
    GITHUB_CLIENT_ID: zod_1.z.string(),
    GITHUB_CLIENT_SECRET: zod_1.z.string(),
    S3_AWS_REGION: zod_1.z.string(),
    S3_BUCKET_NAME: zod_1.z.string(),
    S3_AWS_ACCESS_KEY_ID: zod_1.z.string(),
    S3_AWS_SECRET_ACCESS_KEY: zod_1.z.string(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:\n", parsed.error.format());
    process.exit(1);
}
exports.config = {
    port: parseInt(parsed.data.PORT, 10),
    dbUrl: parsed.data.DATABASE_URL,
    authSecret: parsed.data.BETTER_AUTH_SECRET,
    google: {
        clientId: parsed.data.GOOGLE_CLIENT_ID,
        clientSecret: parsed.data.GOOGLE_CLIENT_SECRET,
    },
    github: {
        clientId: parsed.data.GITHUB_CLIENT_ID,
        clientSecret: parsed.data.GITHUB_CLIENT_SECRET,
    },
    s3: {
        region: parsed.data.S3_AWS_REGION,
        bucket: parsed.data.S3_BUCKET_NAME,
        accessKey: parsed.data.S3_AWS_ACCESS_KEY_ID,
        secretKey: parsed.data.S3_AWS_SECRET_ACCESS_KEY,
    },
};
//# sourceMappingURL=config.js.map