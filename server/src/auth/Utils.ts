import { sendMail } from 'common/Mailer';

export function isLoggedIn(req, res, next) {
  if (!req.user) {
    return Promise.resolve(res.status(401).json({}));
  }
  return Promise.resolve(next());
}

export function generateConfirmationCode() {
  const code = () => String(Math.floor(Math.random() * 900) + 100);
  const first = code();
  const second = code();
  return `${first}${second}`;
}

export function sendConfirmationCode(user) {
  const subject = `Bienvenue sur Celluloid, ${user.username} !`;
  const text =
    `Bonjour ${user.username},\n\n` +
    `Voici votre code de confirmation : ${user.code}\n\n` +
    `Ce code est valable pendant 1 heure.\n\n` +
    `Veuillez le saisir dans le formulaire prévu à cet effet.\n\n` +
    `L'équipe Celluloid vous souhaite la bienvenue !`;
  const html =
    `<h3>Bonjour <b>${user.username},</b></h3>` +
    `<p>Voici votre code de confirmation : <b>${user.code}</b></p>` +
    `<p>Ce code est valable pendant 1 heure.</p>` +
    `<p>Veuillez le saisir dans le formulaire prévu à cet effet.</p>` +
    `<p><b>L'équipe Celluloid vous souhaite la bienvenue !</b></p>`;

  return sendMail(user.email, subject, text, html).then(() =>
    Promise.resolve(user)
  );
}

export function sendPasswordReset(user) {
  const subject = `${
    user.username
  } : réinitialisation de votre mot de passe Celluloid`;
  const text =
    `Bonjour ${user.username},\n\n` +
    `Nous avons reçu Une demande de réinitialisation de mot de passe ` +
    `pour l'adresse email ${user.email}\n\n` +
    `Voici votre code de confirmation: ${user.code}\n\n` +
    `Ce code sera valable pendant 1 heure.\n\n` +
    `Veuillez le saisir dans le formulaire prévu à cet effet.\n\n` +
    `Si vous n'êtes pas à l'origine de cette demande, ` +
    `veuillez simplement ignorer ce mail.\n\n` +
    `Cordialement,\n\n` +
    `L'équipe Celluloid`;
  const html =
    `<h3>Bonjour <b>${user.username},</b></h3>` +
    `<p>Nous avons reçu une demande de réinitialisation de mot de passe ` +
    `pour l'adresse email ${user.email}</p>` +
    `<p>Voici votre code de confirmation : <b>${user.code}</b></p>` +
    `<p>Ce code sera valable pendant 1 heure.</p>` +
    `<p>Veuillez le saisir dans le formulaire prévu à cet effet.</p>` +
    `<p><b/>Si vous n'êtes pas à l'origine de cette demande, ` +
    `veuillez simplement ignorer ce mail.</b></p>` +
    `<p>Cordialement,</p>` +
    `<p><b>L'équipe Celluloid</b></p>`;

  return sendMail(user.email, subject, text, html).then(() =>
    Promise.resolve(user)
  );
}
