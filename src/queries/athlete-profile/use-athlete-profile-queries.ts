import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import type { AthleteProfilesDTO } from '@/contracts/rpc/athlete-profiles/dto';
import { client } from '@/orpc/client';
import { athleteProfilesQueryOptions } from '@/queries/athlete-profile/athlete-profile-query-options';
import { athleteProfileKeys } from '@/queries/keys';

/** keepPreviousData: sort/filter keep prior rows (dimmed) instead of suspending to a skeleton. */
export function useAthleteProfiles(input: AthleteProfilesDTO) {
  return useQuery({
    ...athleteProfilesQueryOptions(input),
    placeholderData: keepPreviousData,
  });
}

export function useAthleteProfilesInfinite(
  input: Omit<AthleteProfilesDTO, 'page'>
) {
  return useInfiniteQuery({
    queryKey: athleteProfileKeys.listInfinite(input),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      client.athleteProfile.list({ ...input, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, allPages) => {
      const fetched = allPages.reduce((acc, p) => acc + p.items.length, 0);
      return fetched < last.total ? allPages.length + 1 : undefined;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAthleteProfilesOrgTotal(options: { enabled?: boolean }) {
  return useQuery({
    ...athleteProfilesQueryOptions({
      page: 1,
      perPage: 1,
      filters: [],
      joinOperator: 'and',
      sorting: [],
    }),
    enabled: options.enabled ?? true,
    select: (data) => data.total,
  });
}
