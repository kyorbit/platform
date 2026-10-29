import type { TournamentActivityEventType } from '@/contracts/activity/dto';
import { client } from '@/orpc/client';
import { activityKeys } from '@/queries/keys';

export function activityListInfiniteQueryOptions(input: {
  tournamentId: string;
  eventTypes?: Array<TournamentActivityEventType>;
  limit?: number;
}) {
  const { tournamentId, eventTypes, limit = 50 } = input;
  return {
    queryKey: activityKeys.listForTournament(tournamentId, eventTypes),
    queryFn: ({ pageParam }: { pageParam: { id: string } | undefined }) =>
      client.activity.listForTournament({
        tournamentId,
        eventTypes:
          eventTypes && eventTypes.length > 0 ? eventTypes : undefined,
        cursor: pageParam,
        limit,
      }),
    initialPageParam: undefined as { id: string } | undefined,
    getNextPageParam: (lastPage: { nextCursor: { id: string } | null }) =>
      lastPage.nextCursor ?? undefined,
  };
}
