import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import type { ListTournamentAthletesDTO } from '@/contracts/rpc/tournament-athletes/dto';
import { client } from '@/orpc/client';
import { tournamentAthleteKeys } from '@/queries/keys';
import { tournamentAthletesQueryOptions } from '@/queries/tournament-athlete/tournament-athlete-query-options';

/**
 * Stable identity for `placeholderData`: same filters / scope, excluding
 * page, perPage, and sorting so paginating or re-sorting keeps prior rows visible.
 */
function getAthleteIdentityKey(input: ListTournamentAthletesDTO): string {
  return JSON.stringify({
    tournamentId: input.tournamentId,
    divisionId: input.divisionId ?? null,
    unassignedOnly: input.unassignedOnly ?? false,
    query: input.query ?? '',
    gender: input.gender ?? null,
    beltLevels: input.beltLevels ?? null,
    beltLevelMin: input.beltLevelMin ?? null,
    beltLevelMax: input.beltLevelMax ?? null,
    weightMin: input.weightMin ?? null,
    weightMax: input.weightMax ?? null,
    status: input.status ?? null,
  });
}

export function useTournamentAthletes(input: ListTournamentAthletesDTO) {
  const placeholderIdentity = getAthleteIdentityKey(input);
  return useQuery({
    ...tournamentAthletesQueryOptions(input),
    placeholderData: (previousData, previousQuery) => {
      if (!previousData || !previousQuery) return undefined;
      const prevInput = previousQuery.queryKey[2] as ListTournamentAthletesDTO;
      if (getAthleteIdentityKey(prevInput) !== placeholderIdentity) {
        return undefined;
      }
      return previousData;
    },
  });
}

export function useTournamentAthletesInfinite(
  input: Omit<ListTournamentAthletesDTO, 'page'>
) {
  return useInfiniteQuery({
    queryKey: tournamentAthleteKeys.listInfinite(input),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      client.tournamentAthlete.list({ ...input, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, allPages) => {
      const fetched = allPages.reduce((acc, p) => acc + p.items.length, 0);
      return fetched < last.total ? allPages.length + 1 : undefined;
    },
    placeholderData: keepPreviousData,
  });
}
