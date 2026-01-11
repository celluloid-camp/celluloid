import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    STORAGE_URL: z.string(),
    STORAGE_ACCESS_KEY: z.string(),
    STORAGE_SECRET_KEY: z.string(),
    STORAGE_BUCKET: z.string().default("celluloid"),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_SECURE: z.string().optional(),
    SMTP_EMAIL_FROM: z.string().default("no-reply@celluloid.me"),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    MISTRAL_API_KEY: z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATIONS === "true",
  emptyStringAsUndefined: true,
});
