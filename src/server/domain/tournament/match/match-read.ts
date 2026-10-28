import { matchDisplayLabelFromDb, matchKindFromDb } from './match-kind';
import type { MatchRead } from '@/contracts/rpc/matches/dto';

export type MatchKind = 'bracket' | 'custom';

/** Match row loaded for policy checks before a mutation. */
export type MatchLoadRow = MatchRead & { tournamentStatus: string };

export function coalesceMatchRead<
  T extends {
    kind?: string | null;
    displayLabel?: string | null;
  },
>(m: T): T & { kind: MatchKind; displayLabel: string | null } {
  return {
    ...m,
    kind: matchKindFromDb(m.kind),
    displayLabel: matchDisplayLabelFromDb(m.displayLabel),
  };
}
