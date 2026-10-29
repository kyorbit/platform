import { z } from 'zod';

export const MATCH_STATUSES = ['pending', 'active', 'complete'] as const;
export const MatchStatusSchema = z.enum(MATCH_STATUSES);
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_KINDS = ['bracket', 'custom'] as const;
export const MatchKindSchema = z.enum(MATCH_KINDS);
export type MatchKind = (typeof MATCH_KINDS)[number];

export const UpdateScoreSchema = z.object({
  matchId: z.string(),
  redWins: z.number().int().min(0).max(2),
  blueWins: z.number().int().min(0).max(2),
});

export const SetWinnerSchema = z.object({
  matchId: z.string(),
  winnerSide: z.enum(['red', 'blue']),
  reason: z.string().optional(),
});

export const SwapParticipantsSchema = z.object({
  matchId: z.string(),
  redTournamentAthleteId: z.string().nullable(),
  blueTournamentAthleteId: z.string().nullable(),
});

export const SetLockSchema = z.object({
  matchId: z.string(),
  side: z.enum(['red', 'blue']),
  locked: z.boolean(),
});

export const GenerateBracketSchema = z.object({
  divisionId: z.string(),
});

export const ShuffleBracketSchema = z.object({
  divisionId: z.string(),
});

export const RegenerateBracketSchema = z.object({
  divisionId: z.string(),
});

export const ResetBracketSchema = z.object({
  divisionId: z.string(),
});

export const AdminSetMatchStatusSchema = z.object({
  matchId: z.string(),
  status: MatchStatusSchema,
});

export const AssignSlotSchema = z.object({
  matchId: z.string(),
  side: z.enum(['red', 'blue']),
  tournamentAthleteId: z.string().nullable(),
});

export const SwapSlotsSchema = z.object({
  matchAId: z.string(),
  sideA: z.enum(['red', 'blue']),
  matchBId: z.string(),
  sideB: z.enum(['red', 'blue']),
});

export const CustomSlotSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('direct'),
    tournamentAthleteId: z.string(),
  }),
  z.object({ mode: z.literal('winner'), feederMatchId: z.string() }),
  z.object({ mode: z.literal('loser'), feederMatchId: z.string() }),
]);

export const CreateCustomMatchSchema = z.object({
  divisionId: z.string(),
  displayLabel: z.string().trim().min(1).max(120),
  red: CustomSlotSchema,
  blue: CustomSlotSchema,
});

export type UpdateScoreDTO = z.infer<typeof UpdateScoreSchema>;
export type SetWinnerDTO = z.infer<typeof SetWinnerSchema>;
export type SwapParticipantsDTO = z.infer<typeof SwapParticipantsSchema>;
export type SetLockDTO = z.infer<typeof SetLockSchema>;
export type GenerateBracketDTO = z.infer<typeof GenerateBracketSchema>;
export type ShuffleBracketDTO = z.infer<typeof ShuffleBracketSchema>;
export type RegenerateBracketDTO = z.infer<typeof RegenerateBracketSchema>;
export type ResetBracketDTO = z.infer<typeof ResetBracketSchema>;
export type AdminSetMatchStatusDTO = z.infer<typeof AdminSetMatchStatusSchema>;
export type AssignSlotDTO = z.infer<typeof AssignSlotSchema>;
export type SwapSlotsDTO = z.infer<typeof SwapSlotsSchema>;
export type CustomSlotDTO = z.infer<typeof CustomSlotSchema>;
export type CreateCustomMatchDTO = z.infer<typeof CreateCustomMatchSchema>;

export type Match = {
  id: string;
  kind: MatchKind;
  displayLabel: string | null;
  divisionId: string;
  tournamentId: string;
  round: number;
  matchIndex: number;
  status: MatchStatus;
  redAthleteId: string | null;
  blueAthleteId: string | null;
  redTournamentAthleteId: string | null;
  blueTournamentAthleteId: string | null;
  redWins: number;
  blueWins: number;
  winnerId: string | null;
  tournamentWinnerId: string | null;
  redLocked: boolean;
  blueLocked: boolean;
  cornersSwapped: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Per-arena order; only reads that compute it set this. */
  arenaSequenceRank?: number | null;
};
