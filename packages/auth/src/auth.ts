import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@celluloid/prisma";
import { admin, emailOTP, username } from "better-auth/plugins";
import { emailQueue } from "@celluloid/queue";
import { env } from "./env";
import { signupAsStudent } from "./plugins/signup-as-student";

export const auth = betterAuth({
  baseURL: env.BASE_URL,
  logger: {
    level: "debug"
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  user: {
    modelName: "User",
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "teacher",
        input: false // don't allow user to set role
      },
      color: {
        type: "string",
        required: false,
        input: false // don't allow user to set role
      },
      initial: {
        type: "string",
        required: false,
        input: false // don't allow user to set role
      },
    }
  },
  plugins: [
    username(),
    signupAsStudent(),
    admin({
      defaultRole: "teacher"
    }),
    emailOTP({
      sendVerificationOnSignUp: true,

      async sendVerificationOTP({
        email,
        otp,
        type
      }) {
        console.log("sendVerificationOTP", email, otp, type);
        emailQueue.add({ email, type, otp });
      },
    })
  ],
  advanced: {
    generateId: false
  }
});
