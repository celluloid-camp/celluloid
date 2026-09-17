import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      OPENROUTER_API_KEY: z.string(),
      TRANSCRIPT_MODEL: z.string().default("mistralai/mistral-large"),
    },
    experimental__runtimeEnv: process.env,
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  });
