import { env as authEnv } from "@celluloid/auth/env";
import { env as prismaEnv } from "@celluloid/prisma/env";
import { env as trpcEnv } from "@celluloid/trpc/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BASE_URL: z.string(),
  },
  client: {
    NEXT_PUBLIC_VERSION: z.string().default("dev"),
    NEXT_PUBLIC_REVISION: z.string().default("dev"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
    NEXT_PUBLIC_REVISION: process.env.NEXT_PUBLIC_REVISION,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATIONS === "true",
  extends: [trpcEnv, prismaEnv, authEnv],
});
