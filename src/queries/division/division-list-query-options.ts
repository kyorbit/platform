import { queryOptions } from '@tanstack/react-query';
import { client } from '@/orpc/client';
import { divisionKeys } from '@/queries/keys';

export function divisionListQueryOptions(tournamentId: string) {
  return queryOptions({
    queryKey: divisionKeys.list(tournamentId),
    queryFn: () => client.division.list({ tournamentId }),
  });
}
