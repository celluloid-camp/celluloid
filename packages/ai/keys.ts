import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      MISTRAL_API_KEY: z.string(),
    },
    experimental__runtimeEnv: process.env,
  });
