import { db } from "@celluloid/db";
import { generateOtp } from "@celluloid/utils";
import { handleUserSignup } from "@celluloid/workflows/user-signup";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, username } from "better-auth/plugins";
import { start } from "workflow/api";
import { keys } from "./keys";
import { saveOTPForTesting } from "./lib/testing";
import { signupAsStudent } from "./plugins/signup-as-student";

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
        input: false, // don't allow user to set role
      },
      initial: {
        type: "string",
        required: false,
        input: false, // don't allow user to set role
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
      generateOTP: () => {
        if (process.env.NODE_ENV === "test" || process.env.CI_TEST === "true") {
          return "123456";
        }
        return generateOtp();
      },
      sendVerificationOnSignUp: true,

      async sendVerificationOTP({ email, otp, type }) {
        console.log("sendVerificationOTP", email, otp, type);
        if (email.includes("temp-")) {
          return;
        }

        if (type === "email-verification") {
          await start(handleUserSignup, [email, otp]);
        }
      },
    }),
    nextCookies(),
  ],
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
    cookie: {
      name: "celluloid_session",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
