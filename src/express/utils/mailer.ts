import nodemailer from 'nodemailer';
import { env } from '../../config/.env';

type MailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export const transporter = nodemailer.createTransport({
  service: env.MAIL_SERVICE,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

export const sendMail = async (opts: MailOptions) => {
  const mail = {
    from: env.ADMIN_EMAIL,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  };

  return transporter.sendMail(mail);
};
