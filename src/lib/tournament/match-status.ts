import type { MatchStatus } from '@/contracts/matches/dto';

export const MATCH_STATUS_RANK: Record<MatchStatus, number> = {
  pending: 0,
  active: 1,
  complete: 2,
};
