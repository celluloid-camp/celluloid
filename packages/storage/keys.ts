import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      STORAGE_URL: z.string().default("http://localhost:9000"),
      STORAGE_BUCKET: z.string().default("celluloid"),
      STORAGE_ACCESS_KEY: z.string().default("xxx"),
      STORAGE_SECRET_KEY: z.string().default("xxx"),
    },
    experimental__runtimeEnv: process.env,
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  });
