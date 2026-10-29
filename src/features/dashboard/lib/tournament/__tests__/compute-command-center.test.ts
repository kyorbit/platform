import { describe, expect, it } from 'vitest';
import { computeCommandCenter } from '../compute-command-center';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentDetail } from '@/contracts/tournaments/dto';

const tournament = {
  id: 't1',
  name: 'Test',
  status: 'draft',
  nameSortKey: 'test',
  arenaDivisionOrder: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lifecycle: { canComplete: false },
  divisions: [],
  _count: { divisions: 1, matches: 4, tournamentAthletes: 8 },
} satisfies TournamentDetail;

describe('computeCommandCenter', () => {
  it('derives setup steps for draft tournament', () => {
    const result = computeCommandCenter({ tournament, matches: [] });

    expect(result.setupSteps).toEqual([
      expect.objectContaining({ id: 'athletes', complete: true }),
      expect.objectContaining({ id: 'divisions', complete: true }),
      expect.objectContaining({ id: 'brackets', complete: false }),
    ]);
  });

  it('marks brackets complete when a bracket match exists', () => {
    const result = computeCommandCenter({
      tournament,
      matches: [
        { id: 'm1', divisionId: 'g1', status: 'pending', kind: 'bracket' },
      ] as Array<Match>,
    });

    expect(result.setupSteps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'brackets', complete: true }),
      ])
    );
  });

  it('treats custom-only matches as brackets not generated', () => {
    const result = computeCommandCenter({
      tournament,
      matches: [
        { id: 'c1', divisionId: 'g1', status: 'pending', kind: 'custom' },
      ] as Array<Match>,
    });

    expect(result.setupSteps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'brackets', complete: false }),
      ])
    );
  });

  it('returns no setup steps for non-draft tournaments', () => {
    const result = computeCommandCenter({
      tournament: { ...tournament, status: 'active' },
      matches: [],
    });

    expect(result.setupSteps).toEqual([]);
  });
});
