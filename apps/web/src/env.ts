import { env as authEnv } from "@celluloid/auth/env";
import { env as prismaEnv } from "@celluloid/prisma/env";
import { env as trpcEnv } from "@celluloid/trpc/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BASE_URL: z.string(),
  },
  client: {},
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATIONS === "true",
  extends: [trpcEnv, prismaEnv, authEnv],
});
