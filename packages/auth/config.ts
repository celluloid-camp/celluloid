import { db } from "@celluloid/db";
import { generate6DigitOtp } from "@celluloid/utils";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, testUtils, username } from "better-auth/plugins";
import { localization } from "better-auth-localization";
import randomColor from "randomcolor";
import { keys } from "./keys";
import { signupAsStudent } from "./plugins/signup-as-student";
import { getSecondaryStorage } from "./storage";

const sharedPlugins = [
  username(),
  signupAsStudent(),
  admin({
    defaultRole: "teacher",
  }),
  emailOTP({
    overrideDefaultEmailVerification: true,
    sendVerificationOnSignUp: false,
    generateOTP() {
      if (
        process.env.NODE_ENV === "test" ||
        process.env.CI_TEST === "true" ||
        process.env.E2E === "1"
      ) {
        return "123456";
      }
      return generate6DigitOtp();
    },
    async sendVerificationOTP({ email, otp, type }) {
      console.log("sendVerificationOTP", email, otp, type);
      if (email.includes("temp-")) {
        return;
      }

      // E2E uses a fixed OTP — skip outbound email / workflow so signup can navigate.
      if (
        process.env.NODE_ENV === "test" ||
        process.env.CI_TEST === "true" ||
        process.env.E2E === "1"
      ) {
        return;
      }

      // Dynamic imports keep Playwright/e2e from loading the email React tree
      const { start } = await import("workflow/api");

      if (type === "forget-password") {
        const { handleForgetPassword } = await import(
          "@celluloid/workflows/forget-password"
        );
        await start(handleForgetPassword, [email, otp]);
        return;
      }

      if (type === "sign-in" || type === "email-verification") {
        const { handleUserSignup } = await import(
          "@celluloid/workflows/user-signup"
        );
        await start(handleUserSignup, [email, otp]);
      }
    },
  }),
  localization({
    defaultLocale: "fr-FR",
    fallbackLocale: "default",
  }),
] as const;

function createAuthOptions(options?: {
  includeTestUtils?: boolean;
}): BetterAuthOptions {
  return {
    baseURL: keys().BASE_URL,
    secret: keys().AUTH_SECRET,
    logger: {
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
    },
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    user: {
      modelName: "user",
      additionalFields: {
        role: {
          type: "string" as const,
          required: true,
          defaultValue: "teacher",
          input: false,
        },
        color: {
          type: "string" as const,
          required: false,
          input: true,
        },
        initial: {
          type: "string" as const,
          required: false,
          input: true,
        },
      },
    },
    plugins: options?.includeTestUtils
      ? [...sharedPlugins, testUtils({ captureOTP: true }), nextCookies()]
      : [...sharedPlugins, nextCookies()],
    secondaryStorage: getSecondaryStorage(),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30,
        version: "2",
      },
    },
    rateLimit: {
      enabled: !(
        process.env.NODE_ENV === "test" ||
        process.env.CI_TEST === "true" ||
        process.env.E2E === "1"
      ),
    },
    advanced: {
      database: {
        generateId: false,
      },
      cookies: {
        session_token: {
          name: "celluloid_session",
        },
      },
    },
    trustedOrigins: ["*.localhost", "https://*.celluloid.me"],
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path.includes("sign-up")) {
          return {
            context: {
              ...ctx,
              body: {
                ...ctx.body,
                name: ctx.body.name || ctx.body.username,
                initial: ctx.body.username
                  .split(" ")
                  .map((part: string) => part.substring(0, 1))
                  .join(""),
                color: randomColor({
                  seed: ctx.body.id,
                  luminosity: "bright",
                }),
              },
            },
          };
        }
      }),
    },
  } as unknown as BetterAuthOptions;
}

export { createAuthOptions };
