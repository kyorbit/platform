import { z } from 'zod';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';

export const DivisionConstraintsSchema = z.object({
  gender: z.enum(['M', 'F']).nullable().optional(),
  beltMin: z.number().int().min(0).max(10).nullable().optional(),
  beltMax: z.number().int().min(0).max(10).nullable().optional(),
  weightMin: z.number().min(20).max(150).nullable().optional(),
  weightMax: z.number().min(20).max(150).nullable().optional(),
});

export const CreateDivisionSchema = z.object({
  name: z.string().min(1, 'Division name is required'),
  tournamentId: z.string(),
});

export const UpdateDivisionSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, 'Division name is required').optional(),
    thirdPlaceMatch: z.boolean().optional(),
  })
  .merge(DivisionConstraintsSchema);

export const AutoAssignSchema = z.object({
  tournamentId: z.string(),
  divisionId: z.string(),
});

export const AutoAssignAllSchema = z.object({
  tournamentId: z.string(),
});

export const AssignAthleteSchema = z.object({
  divisionId: z.string(),
  tournamentAthleteId: z.string(),
});

export const UnassignAthleteSchema = z.object({
  tournamentAthleteId: z.string(),
});

export type CreateDivisionDTO = z.infer<typeof CreateDivisionSchema>;
export type UpdateDivisionDTO = z.infer<typeof UpdateDivisionSchema>;
export type AutoAssignDTO = z.infer<typeof AutoAssignSchema>;
export type AutoAssignAllDTO = z.infer<typeof AutoAssignAllSchema>;
export type AssignAthleteDTO = z.infer<typeof AssignAthleteSchema>;
export type UnassignAthleteDTO = z.infer<typeof UnassignAthleteSchema>;

export type Division = {
  id: string;
  name: string;
  tournamentId: string;
  gender: string | null;
  beltMin: number | null;
  beltMax: number | null;
  weightMin: number | null;
  weightMax: number | null;
  thirdPlaceMatch: boolean;
  arenaIndex: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DivisionListItem = Division & {
  _count: { tournamentAthletes: number; matches: number };
};

export type DivisionDetail = DivisionListItem & {
  tournamentAthletes: Array<TournamentAthlete>;
  matches: Array<Match>;
};

export type DivisionAssignmentRow = Pick<
  TournamentAthlete,
  'id' | 'tournamentId' | 'divisionId' | 'name' | 'status'
>;
