import type { ReleaseMatchClaimDTO } from '@/contracts/arena-match-claim/dto';
import type { SetLastSelectionDTO } from '@/contracts/device-last-selection/dto';
import type { SetWinnerDTO, UpdateScoreDTO } from '@/contracts/matches/dto';

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
