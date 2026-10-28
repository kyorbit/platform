import { authorized } from '@/orpc/middleware';
import { bulkAddAthletes as runBulkAddAthletes } from '@/server/application/tournament-athletes/use-cases/bulk-add';
import { bulkRemoveTournamentAthletes as runBulkRemove } from '@/server/application/tournament-athletes/use-cases/bulk-remove';
import { listTournamentAthletes as runList } from '@/server/application/tournament-athletes/use-cases/list';
import { removeTournamentAthlete as runRemove } from '@/server/application/tournament-athletes/use-cases/remove';
import { updateTournamentAthlete as runUpdate } from '@/server/application/tournament-athletes/use-cases/update';

export const listTournamentAthletes = authorized.tournamentAthlete.list.handler(
  async ({ input, context }) => {
    return runList(input, context.repos.tournamentAthlete);
  }
);

export const bulkAddAthletes = authorized.tournamentAthlete.bulkAdd.handler(
  async ({ input, context }) => {
    return runBulkAddAthletes(
      { ...input, adminId: context.user.id },
      context.repos.tournamentAthlete,
      context.repos.divisionAssign
    );
  }
);

export const updateTournamentAthleteRecord =
  authorized.tournamentAthlete.update.handler(async ({ input, context }) => {
    return runUpdate(input, context.repos.tournamentAthlete);
  });

export const removeTournamentAthleteRecord =
  authorized.tournamentAthlete.remove.handler(async ({ input, context }) => {
    return runRemove({ id: input.id }, context.repos.tournamentAthlete);
  });

export const bulkRemoveTournamentAthleteRecords =
  authorized.tournamentAthlete.bulkRemove.handler(
    async ({ input, context }) => {
      return runBulkRemove(input, context.repos.tournamentAthlete);
    }
  );
