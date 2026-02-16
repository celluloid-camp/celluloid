import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Environment configuration for emails package
 * Uses @t3-oss/env-core for type-safe validation
 */
export const keys = () =>
  createEnv({
    server: {
      // Email Configuration
      RESEND_API_KEY: z.string().min(1, "Resend API key is required"),
      EMAIL_FROM: z.email().default("Celluloid <contact@updates.celluloid.me>"),
      BASE_URL: z.string(),
    },
    experimental__runtimeEnv: process.env,
  });
