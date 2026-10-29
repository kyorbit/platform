import { matchDisplayLabelFromDb, matchKindFromDb } from './match-kind';
import type { Match } from '@/contracts/matches/dto';
import type { Prisma } from '@/generated/prisma/client';
import { MatchStatusSchema } from '@/contracts/matches/dto';
/** Fields required to build {@link Match} for arena labels and bracket tooling. */
export const matchProjectionSelect = {
  id: true,
  kind: true,
  displayLabel: true,
  round: true,
  matchIndex: true,
  status: true,
  redAthleteId: true,
  blueAthleteId: true,
  redTournamentAthleteId: true,
  blueTournamentAthleteId: true,
  redWins: true,
  blueWins: true,
  winnerId: true,
  tournamentWinnerId: true,
  redLocked: true,
  blueLocked: true,
  cornersSwapped: true,
  createdAt: true,
  updatedAt: true,
  divisionId: true,
  tournamentId: true,
} as const satisfies Prisma.MatchSelect;

export type MatchProjectionRow = Prisma.MatchGetPayload<{
  select: typeof matchProjectionSelect;
}> & {
  arenaSequenceRank?: number | null;
};

export function toMatchData(m: MatchProjectionRow): Match {
  return {
    id: m.id,
    kind: matchKindFromDb(m.kind),
    displayLabel: matchDisplayLabelFromDb(m.displayLabel),
    round: m.round,
    matchIndex: m.matchIndex,
    status: MatchStatusSchema.parse(m.status),
    redAthleteId: m.redAthleteId,
    blueAthleteId: m.blueAthleteId,
    redTournamentAthleteId: m.redTournamentAthleteId,
    blueTournamentAthleteId: m.blueTournamentAthleteId,
    redWins: m.redWins,
    blueWins: m.blueWins,
    winnerId: m.winnerId,
    tournamentWinnerId: m.tournamentWinnerId,
    redLocked: m.redLocked,
    blueLocked: m.blueLocked,
    cornersSwapped: m.cornersSwapped,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    divisionId: m.divisionId,
    tournamentId: m.tournamentId,
    arenaSequenceRank: m.arenaSequenceRank ?? null,
  };
}
