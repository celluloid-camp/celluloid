import * as mailer from 'nodemailer';
import * as smtp from 'nodemailer-smtp-transport';
import { logger } from 'backends/Logger';

const log = logger('Email');

const transport = mailer.createTransport(smtp({
  host: process.env.CELLULOID_SMTP_HOST,
  port: parseInt(process.env.CELLULOID_SMTP_PORT, 10),
  secure: process.env.CELLULOID_SMTP_SECURE === 'true',

}));

export function sendMail(
  to: string, subject: string, text: string, html: string) {
  const mailOptions = {
    from: 'Celluloid <no-reply@celluloid.huma-num.fr>', to, subject, text, html
  };

  return new Promise<void>((resolve, reject) => {
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        log.error(
          `Failed to send email to ${to} with body [${text}]`, error);
        reject(new Error('Email sending failed'));
      } else {
        log.info(
          `Email sent to ${to} with subject [${subject}]`, info.response);
        resolve();
      }
    });
  });
}
