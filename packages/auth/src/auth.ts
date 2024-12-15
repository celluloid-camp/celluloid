import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@celluloid/prisma";
import { admin, emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  logger: {
    level: "debug"
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationOTP: async ({ user, url, token }: { user: any, url: any, token: any }) => {
      console.log("sendVerificationOTP", user, url, token);
      return
    },
    sendResetPassword: async ({ user, url, token }: { user: any, url: any, token: any }) => {
      // await sendEmail({
      //     to: user.email,
      //     subject: 'Reset your password',
      //     text: `Click the link to reset your password: ${url}`
      // })
      console.log("sendResetPassword", user, url, token);
      return
    }
  },
  user: {
    modelName: "User",
    fields: {
      name: "username"
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false // don't allow user to set role
      }
    }
  },
  plugins: [
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
        console.log("sendVerificationOTP", email, otp, type);
      },
    })
  ]
});
