import { z } from 'zod';
import type { Page } from '@/contracts/base';

export const TOURNAMENT_STATUSES = ['draft', 'active', 'completed'] as const;
export const TournamentStatusSchema = z.enum(TOURNAMENT_STATUSES);
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const TournamentSortFieldSchema = z.enum([
  'name',
  'status',
  'athletes',
  'createdAt',
]);

export const CreateTournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required'),
});

export const UpdateTournamentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Tournament name is required'),
});

export const SetTournamentStatusSchema = z.object({
  id: z.string(),
  status: TournamentStatusSchema,
  force: z.boolean().optional(),
});

export const SetArenaDivisionOrderSchema = z.object({
  tournamentId: z.string(),
  arenaIndex: z.number().int().min(1),
  divisionIds: z.array(z.string()),
});

export const MoveDivisionArenaSchema = z.object({
  tournamentId: z.string(),
  divisionId: z.string(),
  fromArena: z.number().int().min(1),
  toArena: z.number().int().min(1),
  insertIndex: z.number().int().min(0),
});

export const EnsureArenaSlotSchema = z.object({
  tournamentId: z.string(),
  arenaIndex: z.number().int().min(1).max(3),
});

export const RetireArenaSchema = z.object({
  tournamentId: z.string(),
  fromArena: z.number().int().min(1).max(3),
  toArena: z.number().int().min(1).max(3),
});

export const ListTournamentsSchema = z.object({
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().optional(),
  query: z.string().optional(),
  name: z.string().optional(),
  status: z.array(TournamentStatusSchema).optional(),
  sort: TournamentSortFieldSchema.optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export type CreateTournamentDTO = z.infer<typeof CreateTournamentSchema>;
export type UpdateTournamentDTO = z.infer<typeof UpdateTournamentSchema>;
export type SetTournamentStatusDTO = z.infer<typeof SetTournamentStatusSchema>;
export type SetArenaDivisionOrderDTO = z.infer<
  typeof SetArenaDivisionOrderSchema
>;
export type MoveDivisionArenaDTO = z.infer<typeof MoveDivisionArenaSchema>;
export type EnsureArenaSlotDTO = z.infer<typeof EnsureArenaSlotSchema>;
export type RetireArenaDTO = z.infer<typeof RetireArenaSchema>;
export type ListTournamentsDTO = z.infer<typeof ListTournamentsSchema>;
export type TournamentSortField = z.infer<typeof TournamentSortFieldSchema>;

export type TournamentLifecycleFlags = {
  canComplete: boolean;
};

export type TournamentDivisionSummary = {
  id: string;
  name: string;
  _count: { tournamentAthletes: number; matches: number };
};

export type Tournament = {
  id: string;
  name: string;
  status: TournamentStatus;
  createdAt: Date;
  updatedAt: Date;
  nameSortKey: string;
  /** Map of arena index string → ordered division ids (draft arena scheduling). */
  arenaDivisionOrder: unknown;
};

export type TournamentDetail = Tournament & {
  divisions: Array<TournamentDivisionSummary>;
  _count: { divisions: number; matches: number; tournamentAthletes: number };
  lifecycle: TournamentLifecycleFlags;
};

export type TournamentListItem = Tournament & {
  _count: {
    divisions: number;
    matches: number;
    tournamentAthletes: number;
    actionableMatches: number;
  };
};

export type TournamentsPage = Page<TournamentListItem>;
