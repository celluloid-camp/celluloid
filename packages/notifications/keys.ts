import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    server: {
      NOVU_SECRET_KEY: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER: z.string().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER:
        process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER,
      NOVU_SECRET_KEY: process.env.NOVU_SECRET_KEY,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  });
