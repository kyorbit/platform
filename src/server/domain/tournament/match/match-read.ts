import { matchDisplayLabelFromDb, matchKindFromDb } from './match-kind';
import type { Match, MatchKind, MatchStatus } from '@/contracts/matches/dto';
import { MatchStatusSchema } from '@/contracts/matches/dto';

/** Match row loaded for policy checks before a mutation. */
export type MatchLoadRow = Match & { tournamentStatus: string };

export function coalesceMatchRead<
  T extends {
    kind?: string | null;
    displayLabel?: string | null;
    status: string;
  },
>(
  m: T
): Omit<T, 'kind' | 'displayLabel' | 'status'> & {
  kind: MatchKind;
  displayLabel: string | null;
  status: MatchStatus;
} {
  return {
    ...m,
    kind: matchKindFromDb(m.kind),
    displayLabel: matchDisplayLabelFromDb(m.displayLabel),
    status: MatchStatusSchema.parse(m.status),
  };
}
