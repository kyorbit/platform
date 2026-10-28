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
import type { TournamentDetail, TournamentRow, TournamentsPage } from './dto';
import { ByIdSchema, access, base } from '@/contracts/rpc/base';

export const tournamentContract = {
  list: base
    .meta(access('member'))
    .input(ListTournamentsSchema)
    .output(type<TournamentsPage>()),
  get: base
    .meta(access('member'))
    .input(ByIdSchema)
    .output(type<TournamentDetail>()),
  create: base.input(CreateTournamentSchema).output(type<TournamentRow>()),
  update: base.input(UpdateTournamentSchema).output(type<TournamentRow>()),
  setStatus: base
    .input(SetTournamentStatusSchema)
    .output(type<TournamentRow>()),
  setArenaDivisionOrder: base
    .input(SetArenaDivisionOrderSchema)
    .output(type<unknown>()),
  moveDivisionArena: base
    .input(MoveDivisionArenaSchema)
    .output(type<unknown>()),
  ensureArenaSlot: base.input(EnsureArenaSlotSchema).output(type<unknown>()),
  retireArena: base.input(RetireArenaSchema).output(type<unknown>()),
  delete: base.input(ByIdSchema).output(type<TournamentRow>()),
};
