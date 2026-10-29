import type {
  TournamentDetail,
  TournamentStatus,
  TournamentsPage,
} from '@/contracts/tournaments/dto';

export type ListTournamentsQuery = {
  page?: number;
  perPage?: number;
  query?: string;
  name?: string;
  status?: Array<TournamentStatus>;
  sort?: 'name' | 'status' | 'athletes' | 'createdAt';
  sortDir?: 'asc' | 'desc';
};

export type TournamentReadStore = {
  findWithLifecycle: (id: string) => Promise<TournamentDetail | null>;
  findById: (id: string) => Promise<TournamentDetail | null>;
  list: (query: ListTournamentsQuery) => Promise<TournamentsPage>;
};
