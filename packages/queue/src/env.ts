import { envBoolean } from "@celluloid/utils";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    STORAGE_URL: z.string(),
    STORAGE_ACCESS_KEY: z.string(),
    STORAGE_SECRET_KEY: z.string(),
    STORAGE_BUCKET: z.string().default('celluloid'),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_SECURE: envBoolean({ optional: true, defaultValue: false }),
    SMTP_EMAIL_FROM: z.string().default("no-reply@celluloid.me"),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),

  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
