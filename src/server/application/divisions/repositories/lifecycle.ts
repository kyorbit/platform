import type { Division } from '@/contracts/divisions/dto';
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
  create: (command: CreateDivisionCommand) => Promise<Division>;
  update: (command: UpdateDivisionCommand) => Promise<Division>;
  delete: (command: DeleteDivisionCommand) => Promise<Division>;
};
