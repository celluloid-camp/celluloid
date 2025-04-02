import { createQueue } from "@mgcrea/prisma-queue";
import { sendEmailVerification, sendForgetPassword } from "../mailer/send-mail";
import { prisma, type PrismaClient } from "@celluloid/prisma";

type EmailJobPayload = {
  email: string;
  username?: string;
  type: "sign-in" | "email-verification" | "forget-password";
  otp: string;
};
type EmailJobResult = { status: number };

export const emailQueue = createQueue<EmailJobPayload, EmailJobResult>(
  { name: "emails", prisma: prisma as unknown as PrismaClient },
  async (job, client) => {
    const { id, payload } = job;
    console.log(
      `Processing job#${id} with payload=${JSON.stringify(payload)})`,
    );

    try {
      if (["email-verification", "sign-in"].includes(payload.type)) {
        await sendEmailVerification({
          username: payload.username,
          email: payload.email,
          otp: payload.otp,
        });
      }

      if (payload.type === "forget-password") {
        await sendForgetPassword({
          username: payload.username,
          email: payload.email,
          otp: payload.otp,
        });
      }
    } catch (error) {
      console.error("Error sending email", error);
    }

    const status = 200;
    console.log(`Finished job#${id} with status=${status}`);
    return { status };
  },
);
