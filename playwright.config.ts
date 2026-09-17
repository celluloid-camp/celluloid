/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: "apps/web/.env" });
loadEnv({ path: "apps/web/.env.ci", override: !!process.env.CI });

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 5,
  reporter: process.env.CI
    ? [
        ["github"],
        ["junit", { outputFile: "test-results/junit.xml" }],
        ["html", { outputFolder: "playwright-report" }],
      ]
    : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
};

// CI serves the app via compose.ci.yml — do not start a local standalone process.
if (!process.env.CI) {
  config.webServer = {
    command: "bun apps/web/.next/standalone/apps/web/server.js",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      E2E: "1",
      CI_TEST: "true",
      NODE_ENV: "production",
    },
  };
}

export default defineConfig(config);
