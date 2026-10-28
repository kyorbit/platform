import { type } from '@orpc/contract';
import { GetLastSelectionSchema, SetLastSelectionSchema } from './dto';
import type { LastSelectionPayload } from './dto';
import { base } from '@/contracts/rpc/base';

export const deviceLastSelectionContract = {
  get: base
    .input(GetLastSelectionSchema)
    .output(type<LastSelectionPayload | null>()),
  set: base.input(SetLastSelectionSchema).output(type<LastSelectionPayload>()),
};
