import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      AUTH_SECRET: z.string(),
      BASE_URL: z.string(),
    },
    experimental__runtimeEnv: process.env,
  });
