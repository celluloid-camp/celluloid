import { keys as storageKeys } from "@celluloid/storage/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      BASE_URL: z.string(),
    },
    experimental__runtimeEnv: process.env,
  });
