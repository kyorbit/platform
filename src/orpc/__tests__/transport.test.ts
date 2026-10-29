import { describe, expect, it } from 'vitest';
import { RPCHandler } from '@orpc/server/fetch';
import { createORPCClient, isDefinedError, safe } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { ORPCError, implement } from '@orpc/server';
import { type } from '@orpc/contract';
import { z } from 'zod';
import type { RouterContractClient } from '@orpc/contract';

import { access, base as contractBase, getAccess } from '@/contracts/base';
import { errorStatusMap } from '@/orpc/base';
import { toOrpcError } from '@/orpc/map-app-error';
import { NotFoundError } from '@/server/application/errors';

const contract = {
  ok: contractBase.input(z.object({ d: z.date() })).output(type<{ d: Date }>()),
  missing: contractBase,
  limited: contractBase,
  unauth: contractBase,
  open: contractBase.meta(access('member')),
};

const impl = implement(contract);
const mw = impl.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (e) {
    throw toOrpcError(e);
  }
});
const seen: Record<string, unknown> = {};
const p = impl.use(mw).use(({ path, procedure, next }) => {
  seen[path.join('.')] = getAccess(procedure);
  return next();
});
const router = impl.router({
  ok: p.ok.handler(({ input }) => ({ d: input.d })),
  missing: p.missing.handler(() => {
    throw new NotFoundError('nope');
  }),
  limited: p.limited.handler(({ errors }) => {
    throw errors.RATE_LIMITED();
  }),
  unauth: p.unauth.handler(() => {
    throw new ORPCError('UNAUTHORIZED', { message: 'x' });
  }),
  open: p.open.handler(() => 'ok'),
});

const handler = new RPCHandler(router, { errorStatusMap });
const statuses: Array<number> = [];
const link = new RPCLink({
  origin: 'http://test',
  url: '/api/rpc',
  fetch: async (url, init) => {
    const { response } = await handler.handle(new Request(url, init), {
      prefix: '/api/rpc',
    });
    statuses.push(response!.status);
    return response!;
  },
});
const client: RouterContractClient<typeof contract> = createORPCClient(link);

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

  it('exposes contract access meta to middleware', async () => {
    await client.open();
    await safe(client.missing());
    expect(seen).toMatchObject({ open: 'member', missing: 'admin' });
  });
});
