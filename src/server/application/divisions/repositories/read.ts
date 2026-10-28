import type {
  DivisionDetailRow,
  DivisionListRow,
} from '@/contracts/rpc/divisions/dto';

export type DivisionReadStore = {
  listByTournament: (tournamentId: string) => Promise<Array<DivisionListRow>>;
  findById: (id: string) => Promise<DivisionDetailRow | null>;
};
