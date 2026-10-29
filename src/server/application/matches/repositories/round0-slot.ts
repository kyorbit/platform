import type { Match } from '@/contracts/matches/dto';
import type { MatchLoadRow } from '@/server/domain/tournament/match/match-read';
import type {
  AssignSlotCommand,
  SetLockCommand,
  SwapSlotsCommand,
} from '../use-cases/round0-slot-commands';

export type Round0SlotStore = {
  findMatch: (matchId: string) => Promise<MatchLoadRow | null>;
  setLock: (command: SetLockCommand) => Promise<Match>;
  assignSlot: (command: AssignSlotCommand) => Promise<Match>;
  swapSlots: (command: SwapSlotsCommand) => Promise<Match>;
};
