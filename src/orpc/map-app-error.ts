import { ORPCError } from '@orpc/server';

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  PolicyViolationError,
} from '@/server/application/errors';

export function toOrpcError(e: unknown): unknown {
  if (e instanceof NotFoundError) {
    return new ORPCError('NOT_FOUND', { message: e.message });
  }
  if (e instanceof PolicyViolationError) {
    return new ORPCError('BAD_REQUEST', { message: e.message });
  }
  if (e instanceof BadRequestError) {
    return new ORPCError('BAD_REQUEST', { message: e.message });
  }
  if (e instanceof ForbiddenError) {
    return new ORPCError('FORBIDDEN', { message: e.message });
  }
  return e;
}
