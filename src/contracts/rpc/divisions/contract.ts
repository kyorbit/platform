import { type } from '@orpc/contract';
import { z } from 'zod';
import {
  AssignAthleteSchema,
  AutoAssignAllSchema,
  AutoAssignSchema,
  CreateDivisionSchema,
  UnassignAthleteSchema,
  UpdateDivisionSchema,
} from './dto';
import type {
  DivisionAssignmentRow,
  DivisionDetailRow,
  DivisionListRow,
  DivisionRow,
} from './dto';
import { ByIdSchema, base } from '@/contracts/rpc/base';

export const divisionContract = {
  list: base
    .input(z.object({ tournamentId: z.string() }))
    .output(type<Array<DivisionListRow>>()),
  get: base.input(ByIdSchema).output(type<DivisionDetailRow>()),
  create: base.input(CreateDivisionSchema).output(type<DivisionRow>()),
  update: base.input(UpdateDivisionSchema).output(type<DivisionRow>()),
  delete: base.input(ByIdSchema).output(type<DivisionRow>()),
  autoAssign: base.input(AutoAssignSchema).output(type<{ assigned: number }>()),
  autoAssignAll: base.input(AutoAssignAllSchema).output(
    type<{
      assigned: number;
      divisionsRun: number;
      divisionsSkipped: number;
    }>()
  ),
  assignAthlete: base
    .input(AssignAthleteSchema)
    .output(type<DivisionAssignmentRow>()),
  unassignAthlete: base
    .input(UnassignAthleteSchema)
    .output(type<DivisionAssignmentRow>()),
};
