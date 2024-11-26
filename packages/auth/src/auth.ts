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
    sendOnSignUp: true,
    autoSignInAfterVerification: true
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
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
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false // don't allow user to set role
      },
      initial: {
        type: "string",
        required: false,
        defaultValue: "CC",
        input: false
      },
      color: {
        type: "string",
        required: false,
        defaultValue: "#000000",
        input: false
      },
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
