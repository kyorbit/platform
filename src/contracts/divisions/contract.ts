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
  Division,
  DivisionDetail,
  DivisionListItem,
} from '@/contracts/divisions/dto';
import type { DivisionAssignmentRow } from './dto';
import { ByIdSchema, access, base } from '@/contracts/base';

export const divisionContract = {
  list: base
    .meta(access('member'))
    .input(z.object({ tournamentId: z.string() }))
    .output(type<Array<DivisionListItem>>()),
  get: base
    .meta(access('member'))
    .input(ByIdSchema)
    .output(type<DivisionDetail>()),
  create: base.input(CreateDivisionSchema).output(type<Division>()),
  update: base.input(UpdateDivisionSchema).output(type<Division>()),
  delete: base.input(ByIdSchema).output(type<Division>()),
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
