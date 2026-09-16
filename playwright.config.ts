/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: "apps/web/.env" });
loadEnv({ path: "apps/web/.env.ci", override: !!process.env.CI });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "e2e",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 5,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ["github"],
        ["junit", { outputFile: "test-results/junit.xml" }],
        ["html", { outputFolder: "playwright-report" }],
      ]
    : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Nitro targets Bun when the app is built with Bun — runtime must be Bun.
    command: `bun apps/web/.next/standalone/apps/web/server.js`,
    url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    // Always start a fresh standalone server so E2E/CI_TEST env and the latest
    // build are actually used (reusing a stale :3000 process caused false failures).
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      E2E: "1",
      CI_TEST: "true",
      NODE_ENV: "production",
    },
  },
});
