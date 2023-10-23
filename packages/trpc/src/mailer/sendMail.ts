import mjml2html from 'mjml';
import * as nodemailer from "nodemailer";

import getTransport from "./transport";

const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@celluloid.huma-num.fr";

const isDev = process.env.NODE_ENV !== "production";


export async function sendMail(
  to: string, subject: string, html: string) {
  const transport = await getTransport();
  const mailOptions = {
    from: `Celluloid <${EMAIL_FROM}>`, to, subject, html
  };

  const info = await transport.sendMail(mailOptions);

  if (isDev) {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) {
      // Hex codes here equivalent to chalk.blue.underline
      console.log(
        `Development email preview: \x1B[34m\x1B[4m${url}\x1B[24m\x1B[39m`
      );
    }
  }

}


export async function sendPasswordReset({ username, email, code }: { username: string, email: string, code: string }) {
  const subject = `${username} : réinitialisation de votre mot de passe Celluloid`;

  const mjmlTemplate = `
    <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text><h3>Bonjour <strong>${username},</strong></h3></mj-text>
            <mj-text>Nous avons reçu une demande de réinitialisation de mot de passe pour l'adresse email ${email}</mj-text>
            <mj-text>Voici votre code de confirmation : <strong>${code}</strong></mj-text>
            <mj-text>Ce code sera valable pendant 1 heure.</mj-text>
            <mj-text>Veuillez le saisir dans le formulaire prévu à cet effet.</mj-text>
            <mj-text><strong>Si vous n'êtes pas à l'origine de cette demande, veuillez simplement ignorer ce mail.</strong></mj-text>
            <mj-text>Cordialement,</mj-text>
            <mj-text><strong>L'équipe Celluloid</strong></mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml2html(mjmlTemplate);
  await sendMail(email, subject, html)
}



export async function sendConfirmationCode({ username, email, code }: { username: string, email: string, code: string }) {
  const subject = `${username} : réinitialisation de votre mot de passe Celluloid`;

  const mjmlTemplate = `
  <mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px">
          Bonjour <b>${username},</b>
        </mj-text>
        <mj-text>
          Voici votre code de confirmation : <b>${code}</b>
        </mj-text>
        <mj-text>
          Ce code est valable pendant 1 heure.
        </mj-text>
        <mj-text>
          Veuillez le saisir dans le formulaire prévu à cet effet.
        </mj-text>
        <mj-text font-weight="bold">
          L'équipe Celluloid vous souhaite la bienvenue !
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `;

  const { html } = mjml2html(mjmlTemplate);
  await sendMail(email, subject, html)
}

