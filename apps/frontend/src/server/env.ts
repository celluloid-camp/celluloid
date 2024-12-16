import { createEnv } from "@t3-oss/env-core";
import { env as queueEnv } from "@celluloid/queue/env";
import { env as trpcEnv } from "@celluloid/trpc/env";
import { env as prismaEnv } from "@celluloid/prisma/env";
import { env as authEnv } from "@celluloid/auth/env";
import { z } from "zod";

export const env = createEnv({
  server: {
    BASE_URL: z.string(),
  },
  clientPrefix: 'VITE',
  client: {
    VITE_COMMIT: z.string().default('dev'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  extends: [queueEnv, trpcEnv, prismaEnv, authEnv]
},);
