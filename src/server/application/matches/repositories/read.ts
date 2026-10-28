import type { MatchRead } from '@/contracts/rpc/matches/dto';

export type MatchReadStore = {
  findByDivisionId: (divisionId: string) => Promise<Array<MatchRead>>;
  findByTournamentId: (tournamentId: string) => Promise<Array<MatchRead>>;
  findById: (id: string) => Promise<MatchRead | null>;
};
