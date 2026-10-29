import type { Match } from '@/contracts/matches/dto';

export type MatchReadStore = {
  findByDivisionId: (divisionId: string) => Promise<Array<Match>>;
  findByTournamentId: (tournamentId: string) => Promise<Array<Match>>;
  findById: (id: string) => Promise<Match | null>;
};
