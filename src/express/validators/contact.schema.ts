import { z } from 'zod';
import { RequestHandler } from 'express';
import { AppError } from '../../utils';

export const contactSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export const validateContact: RequestHandler = (req, _res, next) => {
  try {
    const parsed = contactSchema.parse(req.body);
    req.body = parsed;
    return next();
  } catch (err: any) {
    // Zod error
    const message = err?.errors ? err.errors.map((e: any) => e.message).join(', ') : 'Invalid request body';
    return next(new AppError(message, 400));
  }
};
