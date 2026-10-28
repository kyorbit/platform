import type { DivisionRow } from '@/contracts/rpc/divisions/dto';
import type {
  CreateDivisionCommand,
  DeleteDivisionCommand,
  UpdateDivisionCommand,
} from '../use-cases/lifecycle-commands';

export type DivisionLifecycleStore = {
  findTournament: (tournamentId: string) => Promise<{ status: string } | null>;
  findDivision: (id: string) => Promise<{
    id: string;
    tournamentId: string;
    tournamentStatus: string;
  } | null>;
  create: (command: CreateDivisionCommand) => Promise<DivisionRow>;
  update: (command: UpdateDivisionCommand) => Promise<DivisionRow>;
  delete: (command: DeleteDivisionCommand) => Promise<DivisionRow>;
};
