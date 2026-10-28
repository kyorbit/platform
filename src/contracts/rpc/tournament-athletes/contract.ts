import { type } from '@orpc/contract';
import {
  BulkAddAthletesSchema,
  BulkRemoveTournamentAthletesSchema,
  ListTournamentAthletesSchema,
  UpdateTournamentAthleteSchema,
} from './dto';
import type { ListTournamentAthletesResult, TournamentAthleteRow } from './dto';
import { ByIdSchema, access, base } from '@/contracts/rpc/base';

export const tournamentAthleteContract = {
  list: base
    .meta(access('member'))
    .input(ListTournamentAthletesSchema)
    .output(type<ListTournamentAthletesResult>()),
  bulkAdd: base
    .input(BulkAddAthletesSchema)
    .output(type<{ added: number; assigned: number; unassigned: number }>()),
  update: base
    .input(UpdateTournamentAthleteSchema)
    .output(type<TournamentAthleteRow>()),
  remove: base.input(ByIdSchema).output(type<TournamentAthleteRow>()),
  bulkRemove: base
    .input(BulkRemoveTournamentAthletesSchema)
    .output(type<{ removed: number }>()),
};
