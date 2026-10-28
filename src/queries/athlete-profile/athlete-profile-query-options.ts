import { queryOptions } from '@tanstack/react-query';
import type { AthleteProfilesDTO } from '@/contracts/rpc/athlete-profiles/dto';
import { client } from '@/orpc/client';
import { DEFAULT_SORTING } from '@/config/athlete';
import { athleteProfileKeys } from '@/queries/keys';

export const athleteProfilesDefaultListInput = {
  page: 1,
  perPage: 10,
  filters: [],
  joinOperator: 'and',
  sorting: DEFAULT_SORTING,
} satisfies AthleteProfilesDTO;

export function athleteProfilesQueryOptions(input: AthleteProfilesDTO) {
  return queryOptions({
    queryKey: athleteProfileKeys.list(input),
    queryFn: () => client.athleteProfile.list(input),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}
