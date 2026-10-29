import type { MatchStatus } from '@/contracts/matches/dto';

export type BracketMatchInput = {
  kind: 'bracket';
  round: number;
  matchIndex: number;
  status: MatchStatus;
  redTournamentAthleteId: string | null;
  blueTournamentAthleteId: string | null;
  redAthleteId: string | null;
  blueAthleteId: string | null;
  redLocked: boolean;
  blueLocked: boolean;
  divisionId: string;
  tournamentId: string;
};
