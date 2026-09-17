import { betterAuth } from "better-auth";
import { createTestAuthOptions } from "./config";

/**
 * Test-only Better Auth instance with the `testUtils` plugin.
 * Use from Playwright / integration tests — not from the Next.js app.
 */
export const testAuth = betterAuth(createTestAuthOptions());

export type TestAuth = typeof testAuth;
