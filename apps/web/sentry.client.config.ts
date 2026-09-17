import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://spotlight@local/0", // Placeholder DSN

  // Enable Spotlight integration for browser
  integrations: [Sentry.spotlightBrowserIntegration()],

  // Capture 100% of transactions for local development
  tracesSampleRate: 1.0,

  // Enable comprehensive logging
  enableLogs: true,

  // Optional: Enable session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
