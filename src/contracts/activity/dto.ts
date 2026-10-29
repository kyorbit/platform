import { z } from 'zod';

/** Activity audit event vocabulary shared by client, oRPC, and server. */
export const TOURNAMENT_ACTIVITY_EVENT_TYPES = [
  'tournament.status_change',
  'tournament.delete',
  'bracket.generate',
  'bracket.reset',
  'bracket.shuffle',
  'bracket.regenerate',
  'match.score_edit',
  'match.winner_override',
  'match.status_admin',
  'match.swap_participants',
  'match.create_custom',
  'match.delete_custom',
  'division.athlete_assigned',
  'division.athlete_unassigned',
  'division.auto_assign',
] as const;

export type TournamentActivityEventType =
  (typeof TOURNAMENT_ACTIVITY_EVENT_TYPES)[number];

const TournamentActivityEventTypeSchema = z.enum(
  TOURNAMENT_ACTIVITY_EVENT_TYPES
);

export const ListTournamentActivitySchema = z.object({
  tournamentId: z.string(),
  eventTypes: z.array(TournamentActivityEventTypeSchema).max(20).optional(),
  cursor: z.object({ id: z.string() }).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListTournamentActivityDTO = z.infer<
  typeof ListTournamentActivitySchema
>;

export type ActivityListItem = {
  id: string;
  createdAt: Date;
  eventType: string;
  adminId: string;
  adminName: string;
  entityType: string;
  entityId: string;
  payload: unknown;
  summary: string;
};

export type ActivityListPage = {
  items: Array<ActivityListItem>;
  nextCursor: { id: string } | null;
};
