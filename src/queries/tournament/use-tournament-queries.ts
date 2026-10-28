import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ListTournamentsDTO } from '@/contracts/rpc/tournaments/dto';
import {
  tournamentQueryOptions,
  tournamentsAllQueryOptions,
  tournamentsListQueryOptions,
} from '@/queries/tournament/tournament-query-options';

/** Non-suspense: list/home navigations must commit immediately under Router transitions. */
export function useTournaments() {
  return useQuery({
    ...tournamentsAllQueryOptions(),
    select: (data) => data.items,
  });
}

/** Non-suspense: filter/page changes keep prior rows; route shell paints before data. */
export function useTournamentList(input: ListTournamentsDTO) {
  return useQuery({
    ...tournamentsListQueryOptions(input),
    placeholderData: keepPreviousData,
  });
}

/** Suspense: detail routes await this in the loader, then stream deferred islands. */
export function useTournament(id: string) {
  return useSuspenseQuery(tournamentQueryOptions(id));
}
