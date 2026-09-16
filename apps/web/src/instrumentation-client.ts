import * as Sentry from "@sentry/nextjs";

// PostHog init kept commented for now
// import posthog from "posthog-js";
// import { env } from "./env";
//
// posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
//   api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
//   defaults: "2025-05-24",
//   evaluation_environments: [env.NEXT_PUBLIC_STAGE],
// });

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
