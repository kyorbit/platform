import type { Tournament, TournamentStatus } from '@/contracts/tournaments/dto';
import type {
  CreateTournamentCommand,
  DeleteTournamentCommand,
  SetTournamentStatusCommand,
  UpdateTournamentCommand,
} from '../use-cases/lifecycle-commands';

export type TournamentLifecycleContext = {
  id: string;
  status: string;
  lifecycle: { canComplete: boolean };
};

export type ApplyTournamentStatusInput = SetTournamentStatusCommand & {
  fromStatus: TournamentStatus;
};

export type TournamentLifecycleStore = {
  findWithLifecycle: (id: string) => Promise<TournamentLifecycleContext | null>;
  findStatus: (id: string) => Promise<{ status: string } | null>;
  create: (command: CreateTournamentCommand) => Promise<Tournament>;
  update: (command: UpdateTournamentCommand) => Promise<Tournament>;
  applyStatus: (input: ApplyTournamentStatusInput) => Promise<Tournament>;
  delete: (command: DeleteTournamentCommand) => Promise<Tournament>;
};
