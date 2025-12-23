import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || '5000', 10);

const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`)
    .trim(),
  sessionId: z
    .union([
      z.string().uuid(),
      z.string().length(0).transform(() => undefined),
      z.undefined(),
    ])
    .optional(),
});

export function validateChatMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validated = chatMessageSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(error);
  }
}

