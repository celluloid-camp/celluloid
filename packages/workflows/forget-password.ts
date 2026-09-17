import { sendResetPasswordEmail } from "@celluloid/emails";
import { FatalError } from "workflow";

export async function handleForgetPassword(email: string, otp: string) {
  "use workflow";

  await sendForgetPasswordEmail(email, otp);

  return { status: "reset-password-email-sent" };
}

async function sendForgetPasswordEmail(email: string, otp: string) {
  "use step";

  try {
    return await sendResetPasswordEmail({ email, otp });
  } catch (error) {
    throw new FatalError(
      "Error sending reset password email. Skipping retries.",
    );
  }
}
