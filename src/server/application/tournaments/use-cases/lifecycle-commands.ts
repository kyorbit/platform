import type { TournamentStatus } from '@/contracts/tournaments/dto';

export type CreateTournamentCommand = {
  name: string;
};

export type UpdateTournamentCommand = {
  id: string;
  name: string;
};

export type SetTournamentStatusCommand = {
  id: string;
  status: TournamentStatus;
  adminId: string;
  force?: boolean;
};

export type DeleteTournamentCommand = {
  id: string;
  adminId: string;
};
