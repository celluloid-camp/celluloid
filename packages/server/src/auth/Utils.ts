import { UserRecord } from '@celluloid/types';
import { sendMail } from 'backends/Email';
import * as bcrypt from 'bcrypt';
import { paramCase } from 'change-case';
import { NextFunction, Request, Response } from 'express';
import * as ProjectStore from 'store/ProjectStore';
import { TeacherServerRecord  } from 'types/UserTypes';

export function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

export function isLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction) {
  if (!req.user) {
    return Promise.resolve(res.status(401).json({
      error: 'LoginRequired'
    }));
  }
  return Promise.resolve(next());
}

export function isTeacher(
  req: Request,
  res: Response,
  next: NextFunction) {
  if (!req.user || req.user.role !== 'Teacher' ) {
    console.error('User is must be a teacher');
    return Promise.resolve(res.status(403).json({
      error: 'TeacherRoleRequired'
    }));
  }
  return Promise.resolve(next());
}

export function isProjectOwner(
  req: Request,
  res: Response,
  next: NextFunction) {
  const projectId = req.params.projectId;
  const user = req.user as UserRecord;

  return ProjectStore.isOwner(projectId, user)
    .then((result: boolean) => {
      if (result) {
        next();
        return Promise.resolve();
      }
      console.error('User must be project owner');
      res.status(403).json({
        error: 'ProjectOwnershipRequired'
      });
      return Promise.resolve();
    })
    .catch(error => {
      console.error('Failed to check project ownership:', error);
      return Promise.resolve(res.status(500).send());
    });
}

export function isProjectOwnerOrCollaborativeMember(
  req: Request,
  res: Response,
  next: NextFunction) {

  const projectId = req.params.projectId;
  const user = req.user as UserRecord;

  ProjectStore.isOwnerOrCollaborativeMember(projectId, user)
    .then((result: boolean) => {
      if (result) {
        next();
        return Promise.resolve();
      }
      console.error('User must be project owner or collaborator');
      res.status(403).json({
        error: 'ProjectOwnershipOrMembershipRequired'
      });
      return Promise.resolve();
    })
    .catch(error => {
      console.error('Failed project ownership/membership test:', error);
      return Promise.resolve(res.status(500).send());
    });
}

export function generateConfirmationCode() {
  const code = () => String(Math.floor(Math.random() * 900) + 100);
  const first = code();
  const second = code();
  return `${first}${second}`;
}

export function generateUniqueShareName(title: string, count: number) {
  const compare = (a: string, b: string) =>
    b.length - a.length;

  const construct = (result, str) => {
    if (!!str) {
      if (result.join().length < 6) {
        result = [...result, str];
      }
    }
    return result;
  };

  const prefix = paramCase(title)
    .split(/-/)
    .sort(compare)
    .reduce(construct, [])
    .join('-');

  return `${prefix}${count ? count : ''}`;
}

export function sendConfirmationCode(user: TeacherServerRecord) {
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

export function sendPasswordReset(user: TeacherServerRecord) {
  const subject = `${
    user.username
    } : réinitialisation de votre mot de passe Celluloid`;
  const text =
    `Bonjour ${user.username},\n\n` +
    `Nous avons reçu une demande de réinitialisation de mot de passe ` +
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
