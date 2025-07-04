import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    VISION_API_URL: z.string().default("https://vision.celluloid.me"),
    VISION_API_KEY: z.string().default("test"),
  },
  runtimeEnv: process.env,
});
