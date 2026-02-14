import { keys as authKeys } from "@celluloid/auth/keys";
import { keys as dbKeys } from "@celluloid/db/keys";
import { keys as notifications } from "@celluloid/notifications/keys";
import { keys as storageKeys } from "@celluloid/storage/keys";
import { keys as trpcKeys } from "@celluloid/trpc/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BASE_URL: z.string(),
    REDIS_URL: z.string(),
  },
  client: {
    NEXT_PUBLIC_VERSION: z.string().default("0.0.0"),
    NEXT_PUBLIC_COMMIT_SHA: z.string().default("dev"),
    NEXT_PUBLIC_BUILD_TIME: z.string().default("dev"),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().default("xxx"),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().default("https://eu.i.posthog.com"),
    NEXT_PUBLIC_STAGE: z.string().default("dev"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
    NEXT_PUBLIC_COMMIT_SHA: process.env.NEXT_PUBLIC_COMMIT_SHA,
    NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
  },
  extends: [trpcKeys(), dbKeys(), authKeys(), notifications(), storageKeys()],
});
