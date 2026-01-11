import { prisma } from "@celluloid/db";
import { emailQueue } from "@celluloid/queue";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, username } from "better-auth/plugins";
import { env } from "./env";
import { signupAsStudent } from "./plugins/signup-as-student";

export const auth = betterAuth({
  baseURL: env.BASE_URL,
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  user: {
    modelName: "User",
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
      sendVerificationOnSignUp: true,

      async sendVerificationOTP({ email, otp, type }) {
        console.log("sendVerificationOTP", email, otp, type);
        emailQueue.add({ email, type, otp });
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
    generateId: false,
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
