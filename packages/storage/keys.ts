import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      STORAGE_URL: z.string(),
      STORAGE_BUCKET: z.string().default("celluloid"),
      STORAGE_ACCESS_KEY: z.string(),
      STORAGE_SECRET_KEY: z.string(),
    },
    experimental__runtimeEnv: process.env,
  });
