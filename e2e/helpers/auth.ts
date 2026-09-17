import { randomUUID } from "node:crypto";
import { testAuth } from "@celluloid/auth/test-auth";
import type { BrowserContext } from "@playwright/test";

export type TestUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  password: string;
};

function uniqueSuffix() {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export async function getTestHelpers() {
  const ctx = await testAuth.$context;
  const test = ctx.test;
  if (!test) {
    throw new Error(
      "Better Auth testUtils helpers missing. Import testAuth from @celluloid/auth/test-auth.",
    );
  }
  return test;
}

/**
 * Creates a verified user in the DB and injects a signed session cookie
 * into the Playwright browser context (skips UI login).
 */
export async function loginAsTestUser(
  context: BrowserContext,
  overrides?: Partial<Pick<TestUser, "email" | "username" | "name">>,
): Promise<TestUser> {
  const test = await getTestHelpers();
  const suffix = uniqueSuffix();
  const username = overrides?.username ?? `e2e${suffix}`;
  const email = overrides?.email ?? `${username}@example.com`;
  const name = overrides?.name ?? username;
  const password = "testtest";
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

  const user = test.createUser({
    id: randomUUID(),
    email,
    name,
    username,
    displayUsername: username,
    emailVerified: true,
    role: "teacher",
    initial: username.substring(0, 1).toUpperCase(),
    color: "#3b82f6",
  });

  await test.saveUser(user);

  const cookies = await test.getCookies({
    userId: user.id,
    domain: "127.0.0.1",
  });

  // Prefer url-bound cookies (Playwright rejects url+path together).
  await context.clearCookies();
  await context.addCookies(
    cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      url: baseURL,
      httpOnly: cookie.httpOnly ?? true,
      secure: false,
      sameSite: (cookie.sameSite ?? "Lax") as "Lax" | "Strict" | "None",
    })),
  );

  return {
    id: user.id,
    email,
    username,
    name,
    password,
  };
}

export async function deleteTestUser(userId: string) {
  const test = await getTestHelpers();
  await test.deleteUser(userId);
}

/** Looks up a user created via UI signup, then deletes them. No-op if missing. */
export async function deleteTestUserByEmail(email: string) {
  const ctx = await testAuth.$context;
  const found = await ctx.internalAdapter.findUserByEmail(email);
  if (!found?.user?.id) return;
  await deleteTestUser(found.user.id);
}
