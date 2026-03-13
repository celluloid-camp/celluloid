import { db } from "@celluloid/db";
import { generate6DigitOtp } from "@celluloid/utils";
import { handleUserSignup } from "@celluloid/workflows/user-signup";
import { betterAuth, SecondaryStorage } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, genericOAuth, username } from "better-auth/plugins";
import { localization } from "better-auth-localization";
import randomColor from "randomcolor";
import { createClient } from "redis";
import { start } from "workflow/api";
import { keys } from "./keys";
import { signupAsStudent } from "./plugins/signup-as-student";
import { getSecondaryStorage } from "./storage";

export const auth = betterAuth({
  baseURL: keys().BASE_URL,
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
        type: "string",
        required: true,
        defaultValue: "teacher",
        input: false, // don't allow user to set role
      },
      color: {
        type: "string",
        required: false,
        input: true, // don't allow user to set role
      },
      initial: {
        type: "string",
        required: false,
        input: true, // don't allow user to set role
      },
    },
  },
  plugins: [
    username(),
    signupAsStudent(),
    admin({
      defaultRole: "teacher",
    }),
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: false,
      generateOTP() {
        if (process.env.NODE_ENV === "test" || process.env.CI_TEST === "true") {
          return "123456";
        }
        return generate6DigitOtp();
      },
      async sendVerificationOTP({ email, otp, type }) {
        console.log("sendVerificationOTP", email, otp, type);
        if (email.includes("temp-")) {
          return;
        }

        if (type === "sign-in") {
          await start(handleUserSignup, [email, otp]);
        }
      },
    }),
    nextCookies(),
    localization({
      defaultLocale: "fr-FR",
      fallbackLocale: "default",
    }),
  ],
  secondaryStorage: getSecondaryStorage(),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
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
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path.includes("sign-up")) {
        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
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
});

export type Session = typeof auth.$Infer.Session;
