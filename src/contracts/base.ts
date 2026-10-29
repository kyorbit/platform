import { defineMeta, oc } from '@orpc/contract';
import { z } from 'zod';

/** Who may call a procedure. `admin` unless a procedure opts out. */
export type Access = 'admin' | 'member';

export const [access, getAccess] = defineMeta(
  'access',
  (incoming: Access) => incoming
);

export const base = oc.meta(access('admin')).errors({
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

/** One page of a paginated list. */
export type Page<T> = { items: Array<T>; total: number };

export const ByIdSchema = z.object({ id: z.string() });
