import { sendMail } from '../utils/mailer';
import { env } from '../../config/.env';

type ContactPayload = {
  fullName: string;
  email: string;
  message: string;
};

export const sendContactEmails = async (payload: ContactPayload) => {
  const { fullName, email, message } = payload;

  // Email to admin
  const adminSubject = `New contact from ${fullName}`;
  const adminText = `You have received a new message from ${fullName} <${email}>:\n\n${message}`;

  await sendMail({
    to: env.ADMIN_EMAIL || '',
    subject: adminSubject,
    text: adminText,
  });

  // Thank-you email to sender
  const userSubject = 'Thank you for contacting us';
  const userText = `Hi ${fullName},\n\nThank you for reaching out. We received your message and will get back to you soon.\n\nBest regards,\nTeam`;

  await sendMail({
    to: email,
    subject: userSubject,
    text: userText,
  });
};
