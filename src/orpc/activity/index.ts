import { authorized } from '@/orpc/middleware';
import { listActivity as runListActivity } from '@/server/application/activity/use-cases/list';

export const listForTournament = authorized.activity.listForTournament.handler(
  async ({ context, input }) =>
    runListActivity(
      {
        tournamentId: input.tournamentId,
        eventTypes: input.eventTypes,
        cursor: input.cursor,
        limit: input.limit,
      },
      context.repos.activityList
    )
);
