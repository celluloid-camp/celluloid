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
 * Creates a verified credential user in the DB (no browser session).
 */
export async function createTestUser(
  overrides?: Partial<
    Pick<TestUser, "email" | "username" | "name" | "password">
  >,
): Promise<TestUser> {
  const test = await getTestHelpers();
  const ctx = await testAuth.$context;
  const suffix = uniqueSuffix();
  const username = overrides?.username ?? `e2e${suffix}`;
  const email = overrides?.email ?? `${username}@example.com`;
  const name = overrides?.name ?? username;
  const password = overrides?.password ?? "testtest";

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

  const hash = await ctx.password.hash(password);
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });

  return {
    id: user.id,
    email,
    username,
    name,
    password,
  };
}

/**
 * Creates a verified user in the DB and injects a signed session cookie
 * into the Playwright browser context (skips UI login).
 */
export async function loginAsTestUser(
  context: BrowserContext,
  overrides?: Partial<Pick<TestUser, "email" | "username" | "name">>,
): Promise<TestUser> {
  const user = await createTestUser(overrides);
  const test = await getTestHelpers();
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

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

  return user;
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
