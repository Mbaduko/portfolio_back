import { Request, Response, NextFunction } from 'express';
import { sendContactEmails } from '../services/contact.service';

export const postContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, message } = req.body;

    await sendContactEmails({ fullName, email, message });

    return res.status(200).json({ status: 'success', message: 'Message sent successfully' });
  } catch (error) {
    return next(error);
  }
};
