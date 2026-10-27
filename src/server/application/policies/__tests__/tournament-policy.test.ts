import { describe, expect, it } from 'vitest';

import { assertTournamentAction } from '../tournament-policy';

describe('assertTournamentAction', () => {
  it('allows draft-only actions in draft tournaments', () => {
    expect(() =>
      assertTournamentAction('draft', 'bracket.generate')
    ).not.toThrow();
  });

  it('rejects draft-only actions in active tournaments', () => {
    expect(() =>
      assertTournamentAction('active', 'bracket.regenerate')
    ).toThrow('This action is only allowed in Draft status');
  });

  it('allows scoring actions in active tournaments', () => {
    expect(() => assertTournamentAction('active', 'match.score')).not.toThrow();
  });

  it('allows claim actions in active tournaments', () => {
    expect(() => assertTournamentAction('active', 'match.claim')).not.toThrow();
  });

  it('rejects roster actions in active tournaments', () => {
    expect(() => assertTournamentAction('active', 'roster.update')).toThrow(
      'This action is only allowed in Draft status'
    );
  });

  it('rejects workspace actions in completed tournaments', () => {
    expect(() => assertTournamentAction('completed', 'match.score')).toThrow(
      'Completed tournaments are read-only'
    );
  });

  it('allows tournament management in completed tournaments', () => {
    for (const action of [
      'tournament.update',
      'tournament.delete',
      'tournament.status.force',
    ] as const) {
      expect(() => assertTournamentAction('completed', action)).not.toThrow();
    }
  });
});
