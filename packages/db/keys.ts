import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () => createEnv({
  server: {
    DATABASE_URL: z.string(),
    STORAGE_URL: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATIONS === "true",
  emptyStringAsUndefined: true,
});
