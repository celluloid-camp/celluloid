import { render } from "@react-email/components";
import { Resend } from "resend";
import { keys } from "../keys";
import {
  EmailVerification,
  EmailVerificationProps,
  ForgetPasswordEmail,
  ForgetPasswordEmailProps,
  ProjectAnalysisEmail,
  ProjectAnalysisEmailProps,
} from "../templates";

export function getResendClient() {
  const env = keys();
  return new Resend(env.RESEND_API_KEY);
}
async function sendEmail(params: {
  html: string;
  text: string;
  subject: string;
  email: string;
}) {
  const { html, text, subject, email } = params;

  const env = keys();
  const resend = getResendClient();
  const recipient =
    process.env.NODE_ENV === "development" ? "delivered@resend.dev" : email;
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: [recipient],
    subject,
    html,
    text,
  });
  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
  return { success: true, messageId: data?.id };
}

/**
 * Send password reset email to user
 */
export async function sendResetPasswordEmail(params: ForgetPasswordEmailProps) {
  const { username, otp, email } = params;

  // Render React Email component to HTML
  const html = await render(
    ForgetPasswordEmail({
      username,
      otp,
      email,
    }),
  );

  const text = await render(
    ForgetPasswordEmail({
      username,
      otp,
      email,
    }),
    { plainText: true },
  );

  return await sendEmail({
    html,
    text,
    subject: "Réinitialisation de mot de passe Celluloid",
    email,
  });
}

export async function sendEmailVerificationEmail(
  params: EmailVerificationProps,
) {
  const { username, otp, email } = params;

  // Render React Email component to HTML
  const html = await render(
    EmailVerification({
      username,
      otp,
      email,
    }),
  );

  const text = await render(
    EmailVerification({
      username,
      otp,
      email,
    }),
    { plainText: true },
  );

  return await sendEmail({
    html,
    text,
    subject: "Vérification de votre email Celluloid",
    email,
  });
}

export async function sendProjectAnalysisCompletedEmail(
  params: ProjectAnalysisEmailProps,
) {
  const { projectId, projectTitle, email } = params;

  // Render React Email component to HTML
  const html = await render(
    ProjectAnalysisEmail({
      projectId,
      projectTitle,
      email,
    }),
  );

  const text = await render(
    ProjectAnalysisEmail({
      projectId,
      projectTitle,
      email,
    }),
    { plainText: true },
  );

  return await sendEmail({
    html,
    text,
    subject: `Analyse terminée pour le projet ${projectTitle}`,
    email,
  });
}
