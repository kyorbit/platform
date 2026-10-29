import { type } from '@orpc/contract';
import {
  BulkAddAthletesSchema,
  BulkRemoveTournamentAthletesSchema,
  ListTournamentAthletesSchema,
  UpdateTournamentAthleteSchema,
} from './dto';
import type {
  TournamentAthlete,
  TournamentAthletesPage,
} from '@/contracts/tournament-athletes/dto';
import { ByIdSchema, access, base } from '@/contracts/base';

export const tournamentAthleteContract = {
  list: base
    .meta(access('member'))
    .input(ListTournamentAthletesSchema)
    .output(type<TournamentAthletesPage>()),
  bulkAdd: base
    .input(BulkAddAthletesSchema)
    .output(type<{ added: number; assigned: number; unassigned: number }>()),
  update: base
    .input(UpdateTournamentAthleteSchema)
    .output(type<TournamentAthlete>()),
  remove: base.input(ByIdSchema).output(type<TournamentAthlete>()),
  bulkRemove: base
    .input(BulkRemoveTournamentAthletesSchema)
    .output(type<{ removed: number }>()),
};
