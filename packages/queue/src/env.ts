import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    STORAGE_URL: z.string(),
    STORAGE_ACCESS_KEY: z.string(),
    STORAGE_SECRET_KEY: z.string(),
    STORAGE_BUCKET: z.string().default('celluloid'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
