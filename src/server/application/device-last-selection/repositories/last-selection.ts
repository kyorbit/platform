import type {
  GetLastSelectionQuery,
  SetLastSelectionCommand,
} from '../use-cases/commands';
import type { LastSelectionPayload } from '@/contracts/rpc/device-last-selection/dto';

export type DeviceLastSelectionStore = {
  find: (query: GetLastSelectionQuery) => Promise<LastSelectionPayload | null>;
  findMatchContext: (
    matchId: string
  ) => Promise<{ divisionId: string; tournamentId: string } | null>;
  findDivisionContext: (
    divisionId: string
  ) => Promise<{ tournamentId: string } | null>;
  existsTournament: (tournamentId: string) => Promise<boolean>;
  upsert: (command: SetLastSelectionCommand) => Promise<LastSelectionPayload>;
};
