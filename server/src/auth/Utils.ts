import { sendMail } from 'common/Mailer';

export function isLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).json({});
  }
  return next();
}

export function generateConfirmationCode() {
  const code = () => String(Math.floor(Math.random() * 900) + 100);
  const first = code();
  const second = code();
  return `${first}${second}`;
}

export function sendConfirmationCode(code, user) {
  const href = `https://www.celluloid.camp/user/confirm?email=${user.email}`;
  const subject =
     `Bienvenue sur celluloid, ${user.username} !`;
  const text =
     `Bonjour ${user.username},` +
     `Voici votre code de confirmation : ${code}\n\n` +
     `Ce code est valable 24 heures.\n\n` +
     `Veuillez le saisir dans le formulaire prévu à cet effet.\n\n` +
    //  `Vous pouvez le retrouver à ` +
    //  `l'adresse suivante : ${href}\n\n` +
     `L'équipe Celluloid vous souhaite la bienvenue !`;
  const html =
     `<h3>Bonjour <b>${user.username},</b></h3>` +
     `<p>Voici votre code de confirmation : <b>${code}</b></p>` +
     `<p>Ce code est valable 24 heures.</p>` +
     `<pVeuillez le saisir dans le formulaire prévu à cet effet.</p>` +
    //  `<p>Vous pouvez également le retrouver en ` +
    //  `<a href="${href}">cliquant sur ce lien.</a></p>` +
    //  `<p>Si ce lien ne fonctionne pas, rendez-vous à `+
    //  `l'adresse suivante : ${href}</p>` +
     `<p><b>L'équipe Celluloid vous souhaite la bienvenue !</b></p>`;

  return sendMail(
     user.email,
     subject,
     text,
     html
  ).then(() => Promise.resolve(user));
}

export function sendPasswordReset(code, user) {
  const subject =
     `Réinitialisation de votre mot de passe Celluloid, ${user.username} !`;
  const href = `https://www.celluloid.camp/user/reset-password?email=${user.email}`;
  const text =
     `Bonjour ${user.username},` +
     `Une demande de réinitialisation de mot de passe ` +
     `pour l'adresse email ${user.email}\n\n` +
     `Voici votre code de confirmaton: ${code}\n\n` +
     `Ce code est valable 24 heures.\n\n` +
     `Veuillez le saisir dans le formulaire prévu à cet effet.\n\n` +
    //  `Vous pouvez également le retrouver à ` +
    //  `l'adresse suivante : ${href}\n\n` +
     `Si vous n'êtes pas à l'origine de cette demande, ` +
     `veuillez simplement ignorer ce mail.\n\n` +
     `Cordialement,\n\n` +
     `L'équipe Celluloid`;
  const html =
     `<h3>Bonjour <b>${user.username},</b></h3>` +
     `<p>Une demande de réinitialisation de mot de passe ` +
     `pour l'adresse email ${user.email}</p>` +
     `<p>Voici votre code de confirmation : <b>${code}</b></p>` +
     `<p>Ce code est valable 24 heures.</p>` +
     `<pVeuillez le saisir dans le formulaire prévu à cet effet.</p>` +
    //  `<p>Vous pouvez également le retrouver en ` +
    //  `<a href="${href}">cliquant sur ce lien.</a></p>` +
    //  `<p>Si ce lien ne fonctionne pas, rendez-vous à `+
    //  `l'adresse suivante : ${href}</p>` +
     `<p>Si vous n'êtes pas à l'origine de cette demande, ` +
     `veuillez simplement ignorer ce mail.</p>` +
     `<p>Cordialement,</p>` +
     `<p><b>L'équipe Celluloid</b></p>`;

  return sendMail(
     user.email,
     subject,
     text,
     html
  ).then(() => Promise.resolve(user));
}