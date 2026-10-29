import { type } from '@orpc/contract';
import { GetLastSelectionSchema, SetLastSelectionSchema } from './dto';
import type { LastSelectionPayload } from './dto';
import { access, base } from '@/contracts/base';

export const deviceLastSelectionContract = {
  get: base
    .meta(access('member'))
    .input(GetLastSelectionSchema)
    .output(type<LastSelectionPayload | null>()),
  set: base.input(SetLastSelectionSchema).output(type<LastSelectionPayload>()),
};
