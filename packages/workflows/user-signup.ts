import { sendEmailVerificationEmail } from "@celluloid/emails";
import { FatalError, sleep } from "workflow";

export async function handleUserSignup(email: string, otp: string) {
  "use workflow";

  await sendVerificationEmail(email, otp);

  return { status: "verification-email-sent" };
}

async function sendVerificationEmail(email: string, otp: string) {
  "use step";

  try {
    return await sendEmailVerificationEmail({ email, otp });
  } catch (error) {
    throw new FatalError("Error sending verification email. Skipping retries.");
  }
}
