import { env } from '@celluloid/utils';
import { promises as fsp } from "fs";
import * as nodemailer from "nodemailer";
const { readFile, writeFile } = fsp;

const isTest = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV !== "production";

let transporterPromise: Promise<nodemailer.Transporter>;
const etherealFilename = `${process.cwd()}/.ethereal`;

let logged = false;

export default function getTransport(): Promise<nodemailer.Transporter> {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (isTest) {
        return nodemailer.createTransport({
          jsonTransport: true,
        });
      } else if (isDev) {
        let account;
        try {
          const testAccountJson = await readFile(etherealFilename, "utf8");
          account = JSON.parse(testAccountJson);
        } catch (e: any) {
          account = await nodemailer.createTestAccount();
          await writeFile(etherealFilename, JSON.stringify(account));
        }
        if (!logged) {
          logged = true;
          console.log();
          console.log();
          console.log(
            // Escapes equivalent to chalk.bold
            "\x1B[1m" +
            " ✉️ Emails in development are sent via ethereal.email; your credentials follow:" +
            "\x1B[22m"
          );
          console.log("  Site:     https://ethereal.email/login");
          console.log(`  Username: ${account.user}`);
          console.log(`  Password: ${account.pass}`);
          console.log();
          console.log();
        }
        return nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
      } else {
        if (!env.SMTP_HOST) {
          throw new Error("Misconfiguration: no SMTP_HOST");
        }
        if (!env.SMTP_PORT) {
          throw new Error("Misconfiguration: no SMTP_PORT");
        }
        return nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
        });
      }
    })();
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return transporterPromise!;
}
