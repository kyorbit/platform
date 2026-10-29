import type { TournamentStatus } from '@/contracts/tournaments/dto';
import { TournamentStatusSchema } from '@/contracts/tournaments/dto';
import { PolicyViolationError } from '@/server/application/errors';

export type TournamentAction =
  | 'division.create'
  | 'division.update'
  | 'division.delete'
  | 'division.assignAthlete'
  | 'division.autoAssign'
  | 'arenaOrder.update'
  | 'bracket.generate'
  | 'bracket.shuffle'
  | 'bracket.reset'
  | 'bracket.regenerate'
  | 'match.score'
  | 'match.claim'
  | 'match.custom.create'
  | 'match.custom.delete'
  | 'match.slot.edit'
  | 'roster.add'
  | 'roster.update'
  | 'roster.delete'
  | 'tournament.update'
  | 'tournament.delete'
  | 'tournament.status.force';

const draftOnly = new Set<TournamentAction>([
  'division.create',
  'division.update',
  'division.delete',
  'division.assignAthlete',
  'division.autoAssign',
  'arenaOrder.update',
  'bracket.generate',
  'bracket.shuffle',
  'bracket.reset',
  'bracket.regenerate',
  'match.slot.edit',
  'roster.add',
  'roster.update',
  'roster.delete',
  'tournament.delete',
]);

// Completed freezes the workspace, but the tournament itself stays manageable.
const completedAllowed = new Set<TournamentAction>([
  'tournament.update',
  'tournament.delete',
  'tournament.status.force',
]);

export function assertTournamentAction(
  status: TournamentStatus | string,
  action: TournamentAction
) {
  const parsedStatus = TournamentStatusSchema.parse(status);

  if (parsedStatus === 'completed') {
    if (completedAllowed.has(action)) return;
    throw new PolicyViolationError('Completed tournaments are read-only');
  }
  if (draftOnly.has(action) && parsedStatus !== 'draft') {
    throw new PolicyViolationError(
      'This action is only allowed in Draft status'
    );
  }
}

export function assertCanForceTournamentStatus(
  status: TournamentStatus | string
) {
  assertTournamentAction(status, 'tournament.status.force');
}
