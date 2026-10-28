import type {
  TournamentDetail,
  TournamentsPage,
} from '@/contracts/rpc/tournaments/dto';
import type { TournamentStatusValue } from '@/lib/tournament/tournament-status';

export type ListTournamentsQuery = {
  page?: number;
  perPage?: number;
  query?: string;
  name?: string;
  status?: Array<TournamentStatusValue>;
  sort?: 'name' | 'status' | 'athletes' | 'createdAt';
  sortDir?: 'asc' | 'desc';
};

export type TournamentReadStore = {
  findWithLifecycle: (id: string) => Promise<TournamentDetail | null>;
  findById: (id: string) => Promise<TournamentDetail | null>;
  list: (query: ListTournamentsQuery) => Promise<TournamentsPage>;
};
