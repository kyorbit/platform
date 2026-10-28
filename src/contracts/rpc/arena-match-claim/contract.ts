import { type } from '@orpc/contract';
import { ClaimMatchSchema, ReleaseMatchClaimSchema } from './dto';
import { base } from '@/contracts/rpc/base';

export const arenaMatchClaimContract = {
  claim: base.input(ClaimMatchSchema).output(type<unknown>()),
  release: base
    .input(ReleaseMatchClaimSchema)
    .output(type<{ removed: boolean }>()),
};
