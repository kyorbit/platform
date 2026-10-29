import { COMMON_ERROR_STATUS_MAP, implement } from '@orpc/server';
import type { ServerRepos } from '@/server/composition';
import { contract } from '@/contracts/router';

export const base = implement(contract).$context<{
  headers: Headers;
  repos: ServerRepos;
}>();

// v2 has no `status` on errors; handlers map codes, unmapped ones fall back to 400.
export const errorStatusMap = { ...COMMON_ERROR_STATUS_MAP, RATE_LIMITED: 429 };
