import { createEnv } from "@t3-oss/env-core";
import { env as prismaEnv } from "@celluloid/prisma/env";
import { env as queueEnv } from "@celluloid/queue/env";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    WORKER_PORT: z.coerce.number().default(3002),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATIONS === "true",
  extends: [prismaEnv, queueEnv],
});
