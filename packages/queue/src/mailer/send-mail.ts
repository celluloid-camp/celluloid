import {
  EmailVerification,
  ForgetPasswordEmail,
  ProjectAnalysisEmail,
} from "@celluloid/emails";
import { render } from "@react-email/components";
import { Resend } from "resend";
import { env } from "../env";

export async function sendMail(to: string, subject: string, html: string) {
  const recipient =
    process.env.NODE_ENV === "development" ? "delivered@resend.dev" : to;

  const resend = new Resend(env.RESEND_API_KEY);
  resend.emails.send({
    from: env.EMAIL_FROM,
    to: recipient,
    subject,
    html,
  });
  return true;
}

export async function sendForgetPassword({
  username,
  email,
  otp,
}: {
  username?: string;
  email: string;
  otp: string;
}) {
  const subject = "[Celluloid] Réinitialisation de votre mot de passe.";
  const emailHtml = await render(ForgetPasswordEmail({ username, email, otp }));
  return sendMail(email, subject, emailHtml);
}

export async function sendEmailVerification({
  username,
  email,
  otp,
}: {
  username?: string;
  email: string;
  otp: string;
}) {
  const subject = "[Celluloid] Vérification de votre email";
  const emailHtml = await render(EmailVerification({ username, otp }));
  return sendMail(email, subject, emailHtml);
}

export async function sendProjectAnalysisFinished({
  email,
  projectId,
  projectTitle,
}: {
  email: string;
  projectId: string;
  projectTitle: string;
}) {
  const subject = `[Celluloid] Analyse terminée`;
  const emailHtml = await render(
    ProjectAnalysisEmail({ projectId, projectTitle }),
  );
  return sendMail(email, subject, emailHtml);
}
