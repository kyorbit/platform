import { queryOptions } from '@tanstack/react-query';
import { client } from '@/orpc/client';
import { matchKeys } from '@/queries/keys';

export function matchesByDivisionQueryOptions(divisionId: string) {
  return queryOptions({
    queryKey: matchKeys.listByDivision(divisionId),
    queryFn: () => client.match.list({ divisionId }),
  });
}

export function tournamentMatchesQueryOptions(tournamentId: string) {
  return queryOptions({
    queryKey: matchKeys.listByTournament(tournamentId),
    queryFn: () => client.match.list({ tournamentId }),
  });
}
