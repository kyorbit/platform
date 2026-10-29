import { describe, expect, it, vi } from 'vitest';
import { call } from '@orpc/server';
import type { AnyProcedure } from '@orpc/server';
import { getAccess } from '@/contracts/base';
import { auth } from '@/lib/auth';
import router from '@/orpc/router';

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));

function procedures(
  node: object,
  path: Array<string> = []
): Array<[string, AnyProcedure]> {
  if ('~orpc' in node) return [[path.join('.'), node as AnyProcedure]];
  return Object.entries(node).flatMap(([key, child]) =>
    procedures(child as object, [...path, key])
  );
}

async function codeFor(procedure: AnyProcedure) {
  const context = { headers: new Headers(), repos: {} as never };
  try {
    await call(procedure, {}, { context });
    return 'OK';
  } catch (e) {
    return (e as { code?: string }).code ?? 'THROWN';
  }
}

describe('authorized access chain', () => {
  it('rejects a non-admin from every admin procedure, and only those', async () => {
    // A session whose user fails assertSystemAdmin (no id).
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: {},
      session: {},
    } as never);

    const all = procedures(router);
    expect(all).toHaveLength(52);

    for (const [path, procedure] of all) {
      const code = await codeFor(procedure);
      const forbidden = code === 'FORBIDDEN';
      expect([path, forbidden]).toEqual([
        path,
        getAccess(procedure) !== 'member',
      ]);
    }
  });

  it('rejects calls without a session before anything else', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
    for (const [, procedure] of procedures(router)) {
      expect(await codeFor(procedure)).toBe('UNAUTHORIZED');
    }
  });
});
