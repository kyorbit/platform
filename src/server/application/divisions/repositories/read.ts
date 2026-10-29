import type {
  DivisionDetail,
  DivisionListItem,
} from '@/contracts/divisions/dto';

export type DivisionReadStore = {
  listByTournament: (tournamentId: string) => Promise<Array<DivisionListItem>>;
  findById: (id: string) => Promise<DivisionDetail | null>;
};
