import { type } from '@orpc/contract';
import {
  CreateTournamentSchema,
  EnsureArenaSlotSchema,
  ListTournamentsSchema,
  MoveDivisionArenaSchema,
  RetireArenaSchema,
  SetArenaDivisionOrderSchema,
  SetTournamentStatusSchema,
  UpdateTournamentSchema,
} from './dto';
import type { Tournament } from '@/contracts/tournaments/dto';
import type { TournamentDetail, TournamentsPage } from './dto';
import { ByIdSchema, access, base } from '@/contracts/base';

export const tournamentContract = {
  list: base
    .meta(access('member'))
    .input(ListTournamentsSchema)
    .output(type<TournamentsPage>()),
  get: base
    .meta(access('member'))
    .input(ByIdSchema)
    .output(type<TournamentDetail>()),
  create: base.input(CreateTournamentSchema).output(type<Tournament>()),
  update: base.input(UpdateTournamentSchema).output(type<Tournament>()),
  setStatus: base.input(SetTournamentStatusSchema).output(type<Tournament>()),
  setArenaDivisionOrder: base
    .input(SetArenaDivisionOrderSchema)
    .output(type<unknown>()),
  moveDivisionArena: base
    .input(MoveDivisionArenaSchema)
    .output(type<unknown>()),
  ensureArenaSlot: base.input(EnsureArenaSlotSchema).output(type<unknown>()),
  retireArena: base.input(RetireArenaSchema).output(type<unknown>()),
  delete: base.input(ByIdSchema).output(type<Tournament>()),
};
