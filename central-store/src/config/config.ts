import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(10),
  PORT: z.string().default("8080"),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  S3_AWS_REGION: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_AWS_ACCESS_KEY_ID: z.string(),
  S3_AWS_SECRET_ACCESS_KEY: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n", parsed.error.format());
  process.exit(1);
}

export const config = {
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
