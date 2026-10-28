import { oc } from '@orpc/contract';
import { z } from 'zod';

export const base = oc.errors({
  RATE_LIMITED: {
    message: 'Too many requests. Please try again later.',
  },
  BAD_REQUEST: {
    message: 'Bad request.',
  },
  NOT_FOUND: {
    message: 'Not found.',
  },
  FORBIDDEN: {
    message: 'This is forbidden.',
  },
  UNAUTHORIZED: {
    message: 'You are Unauthorized.',
  },
  INTERNAL_SERVER_ERROR: {
    message: 'Internal Server Error.',
  },
  CONFLICT: {
    message: 'Conflict.',
  },
});

export const ByIdSchema = z.object({ id: z.string() });
