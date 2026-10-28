import { describe, expect, it } from 'vitest';
import { RPCHandler } from '@orpc/server/fetch';
import { createORPCClient, isDefinedError, safe } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import type { RouterClient } from '@orpc/server';

import { base, errorStatusMap } from '@/orpc/base';
import { toOrpcError } from '@/orpc/map-app-error';
import { NotFoundError } from '@/server/application/errors';

const mw = base.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (e) {
    throw toOrpcError(e);
  }
});
const p = base.use(mw);
const router = {
  ok: p
    .input(z.object({ d: z.date() }))
    .handler(({ input }) => ({ d: input.d })),
  missing: p.handler(() => {
    throw new NotFoundError('nope');
  }),
  limited: p.handler(({ errors }) => {
    throw errors.RATE_LIMITED();
  }),
  unauth: p.handler(() => {
    throw new ORPCError('UNAUTHORIZED', { message: 'x' });
  }),
};

const handler = new RPCHandler(router, { errorStatusMap });
const statuses: Array<number> = [];
const link = new RPCLink({
  origin: 'http://test',
  url: '/api/rpc',
  fetch: async (url, init) => {
    const { response } = await handler.handle(new Request(url, init), {
      prefix: '/api/rpc',
      context: { headers: new Headers(), repos: {} as never },
    });
    statuses.push(response!.status);
    return response!;
  },
});
const client: RouterClient<typeof router> = createORPCClient(link);

describe('rpc transport', () => {
  it('round-trips, maps statuses, and keeps errors defined', async () => {
    const d = new Date('2026-01-01');
    expect((await client.ok({ d })).d).toEqual(d);
    for (const call of [client.missing, client.limited, client.unauth]) {
      const [error, , definedError] = await safe(call());
      expect(isDefinedError(error)).toBe(true);
      expect(definedError).toBe(error);
    }
    expect(statuses).toEqual([200, 404, 429, 401]);
  });
});
