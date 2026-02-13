import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      BASE_URL: z.string(),
      REDIS_URL: z.string().default("redis://localhost"),
      STORAGE_URL: z.string(),
      STORAGE_ACCESS_KEY: z.string(),
      STORAGE_SECRET_KEY: z.string(),
      STORAGE_BUCKET: z.string().default("celluloid"),
    },
    experimental__runtimeEnv: process.env,
  });
