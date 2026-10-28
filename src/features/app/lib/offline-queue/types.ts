import type { ReleaseMatchClaimDTO } from '@/contracts/rpc/arena-match-claim/dto';
import type { SetLastSelectionDTO } from '@/contracts/rpc/device-last-selection/dto';
import type { SetWinnerDTO, UpdateScoreDTO } from '@/contracts/rpc/matches/dto';

export type ArenaMutation =
  | { kind: 'match.updateScore'; payload: UpdateScoreDTO }
  | { kind: 'match.setWinner'; payload: SetWinnerDTO }
  | { kind: 'device.lastSelection.set'; payload: SetLastSelectionDTO }
  | { kind: 'arenaMatchClaim.release'; payload: ReleaseMatchClaimDTO };

export type ArenaMutationRow = {
  id: number;
  kind: ArenaMutation['kind'];
  payload: unknown;
  createdAt: number;
  attempts: number;
};
