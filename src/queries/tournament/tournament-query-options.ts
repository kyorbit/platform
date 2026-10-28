import { queryOptions } from '@tanstack/react-query';
import type { ListTournamentsDTO } from '@/contracts/rpc/tournaments/dto';
import { client } from '@/orpc/client';
import { tournamentKeys } from '@/queries/keys';

const ALL_TOURNAMENTS_PER_PAGE = 1000;

export const tournamentsDefaultListInput = {
  page: 1,
  perPage: 20,
  status: [],
  sortDir: 'desc',
} satisfies ListTournamentsDTO;

const tournamentsAllListInput = {
  ...tournamentsDefaultListInput,
  perPage: ALL_TOURNAMENTS_PER_PAGE,
} satisfies ListTournamentsDTO;

export function tournamentsListQueryOptions(input: ListTournamentsDTO) {
  return queryOptions({
    queryKey: tournamentKeys.list(input),
    queryFn: () => client.tournament.list(input),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

export function tournamentsAllQueryOptions() {
  return queryOptions({
    queryKey: tournamentKeys.listAll(),
    queryFn: () => client.tournament.list(tournamentsAllListInput),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

export function tournamentQueryOptions(id: string) {
  return queryOptions({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => client.tournament.get({ id }),
  });
}
