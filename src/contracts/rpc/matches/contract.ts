import { type } from '@orpc/contract';
import { z } from 'zod';
import {
  AdminSetMatchStatusSchema,
  AssignSlotSchema,
  CreateCustomMatchSchema,
  GenerateBracketSchema,
  RegenerateBracketSchema,
  ResetBracketSchema,
  SetLockSchema,
  SetWinnerSchema,
  ShuffleBracketSchema,
  SwapParticipantsSchema,
  SwapSlotsSchema,
  UpdateScoreSchema,
} from './dto';
import type { MatchRead } from './dto';
import { ByIdSchema, access, base } from '@/contracts/rpc/base';

const match = type<MatchRead>();
const matches = type<Array<MatchRead>>();

export const matchContract = {
  list: base
    .meta(access('member'))
    .input(
      z.object({
        divisionId: z.string().optional(),
        tournamentId: z.string().optional(),
      })
    )
    .output(matches),
  get: base.meta(access('member')).input(ByIdSchema).output(match),
  createCustom: base.input(CreateCustomMatchSchema).output(match),
  adminSetMatchStatus: base.input(AdminSetMatchStatusSchema).output(match),
  delete: base.input(ByIdSchema).output(match),
  updateScore: base.input(UpdateScoreSchema).output(match),
  setWinner: base.input(SetWinnerSchema).output(match),
  swapParticipants: base.input(SwapParticipantsSchema).output(match),
  setLock: base.input(SetLockSchema).output(match),
  assignSlot: base.input(AssignSlotSchema).output(match),
  swapSlots: base.input(SwapSlotsSchema).output(match),
};

export const bracketContract = {
  generate: base.input(GenerateBracketSchema).output(matches),
  shuffle: base.input(ShuffleBracketSchema).output(matches),
  regenerate: base.input(RegenerateBracketSchema).output(matches),
  reset: base.input(ResetBracketSchema).output(matches),
};
