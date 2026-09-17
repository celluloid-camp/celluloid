import { betterAuth } from "better-auth";
import { createAuthOptions } from "./config";

/**
 * Test-only Better Auth instance with the `testUtils` plugin.
 * Use from Playwright / integration tests — not from the Next.js app.
 */
export const testAuth = betterAuth(
  createAuthOptions({ includeTestUtils: true }),
);

export type TestAuth = typeof testAuth;
