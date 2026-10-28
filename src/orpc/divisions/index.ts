import { authorized } from '@/orpc/middleware';
import {
  assignAthleteToDivision as runAssignAthleteToDivision,
  autoAssignAllEligible as runAutoAssignAllEligible,
  autoAssignDivision as runAutoAssignDivision,
  unassignAthleteFromDivision as runUnassignAthleteFromDivision,
} from '@/server/application/divisions/use-cases/assign';
import {
  createDivision as runCreateDivision,
  deleteDivision as runDeleteDivision,
  updateDivision as runUpdateDivision,
} from '@/server/application/divisions/use-cases/lifecycle';
import {
  getDivision as runGetDivision,
  listDivisionsByTournament as runListDivisionsByTournament,
} from '@/server/application/divisions/use-cases/read';

export const listDivisions = authorized.division.list.handler(
  async ({ context, input }) =>
    runListDivisionsByTournament(input.tournamentId, context.repos.divisionRead)
);

export const getDivision = authorized.division.get.handler(
  async ({ context, input }) =>
    runGetDivision(input.id, context.repos.divisionRead)
);

export const createDivision = authorized.division.create.handler(
  async ({ input, context }) => {
    return runCreateDivision(input, context.repos.divisionLifecycle);
  }
);

export const updateDivision = authorized.division.update.handler(
  async ({ input, context }) => {
    return runUpdateDivision(input, context.repos.divisionLifecycle);
  }
);

export const removeDivision = authorized.division.delete.handler(
  async ({ context, input }) => {
    return runDeleteDivision({ id: input.id }, context.repos.divisionLifecycle);
  }
);

export const autoAssignDivision = authorized.division.autoAssign.handler(
  async ({ input, context }) => {
    return runAutoAssignDivision(
      { ...input, adminId: context.user.id },
      context.repos.divisionAssign
    );
  }
);

export const autoAssignAllDivisions = authorized.division.autoAssignAll.handler(
  async ({ input, context }) => {
    return runAutoAssignAllEligible(
      { tournamentId: input.tournamentId, adminId: context.user.id },
      context.repos.divisionAssign
    );
  }
);

export const assignAthleteToDivision =
  authorized.division.assignAthlete.handler(async ({ input, context }) => {
    return runAssignAthleteToDivision(
      { ...input, adminId: context.user.id },
      context.repos.divisionAssign
    );
  });

export const unassignAthleteFromDivision =
  authorized.division.unassignAthlete.handler(async ({ input, context }) => {
    return runUnassignAthleteFromDivision(
      { ...input, adminId: context.user.id },
      context.repos.divisionAssign
    );
  });
