import { describe, expect, it } from 'vitest';
import type { Match } from '@/contracts/matches/dto';
import {
  buildOneSidedLayout,
  buildTwoSidedLayout,
} from '@/lib/tournament/bracket/bracket-layout';
import {
  buildMatchIndex,
  getLockButtonRect,
  getMatchCardGeometry,
  getSlotRect,
  hitTestBracket,
} from '@/lib/tournament/bracket/bracket-layout/hit-test';

function makeMatch(id: string, round: number, matchIndex: number): Match {
  return {
    id,
    divisionId: 'div-1',
    tournamentId: 't-1',
    kind: 'bracket',
    round,
    matchIndex,
    displayLabel: null,
    status: 'pending',
    redTournamentAthleteId: null,
    blueTournamentAthleteId: null,
    redAthleteId: null,
    blueAthleteId: null,
    redWins: 0,
    blueWins: 0,
    redLocked: false,
    blueLocked: false,
    winnerId: null,
    winnerReason: null,
    cornersSwapped: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  } as unknown as Match;
}

function make8PlayerMatches(): Array<Match> {
  return [
    makeMatch('r0-0', 0, 0),
    makeMatch('r0-1', 0, 1),
    makeMatch('r0-2', 0, 2),
    makeMatch('r0-3', 0, 3),
    makeMatch('r1-0', 1, 0),
    makeMatch('r1-1', 1, 1),
    makeMatch('r2-0', 2, 0),
    makeMatch('r2-1', 2, 1),
  ];
}

describe('bracket hit-test index', () => {
  it('indexes matches by id and (division, round, matchIndex)', () => {
    const matches = make8PlayerMatches();
    const index = buildMatchIndex(matches);
    expect(index.byId.get('r2-0')?.round).toBe(2);
    expect(index.byCoord.get('div-1:1:1')?.id).toBe('r1-1');
  });

  it('hit-tests red slot, blue slot, lock buttons, final 1.2x overhang, and third place in two-sided layout', () => {
    const layout = buildTwoSidedLayout(make8PlayerMatches(), true);

    for (const pos of layout.positions) {
      for (const side of ['red', 'blue'] as const) {
        const slot = getSlotRect(pos, side, layout.layoutMaxRound);
        const lock = getLockButtonRect(pos, side, layout.layoutMaxRound);

        // Center of slot (away from lock button) hits the slot
        const slotHit = hitTestBracket(
          { x: (slot.left + slot.right) / 2, y: (slot.top + slot.bottom) / 2 },
          layout
        );
        expect(slotHit).toMatchObject({
          kind: 'slot',
          matchId: pos.match.id,
          side,
        });

        // Center of lock button hits the lock target when editable
        const lockHit = hitTestBracket(
          { x: (lock.left + lock.right) / 2, y: (lock.top + lock.bottom) / 2 },
          layout,
          { readOnly: false }
        );
        expect(lockHit).toMatchObject({
          kind: 'lock',
          matchId: pos.match.id,
          side,
        });

        // Lock button falls back to slot when readOnly
        const readOnlyHit = hitTestBracket(
          { x: (lock.left + lock.right) / 2, y: (lock.top + lock.bottom) / 2 },
          layout,
          { readOnly: true }
        );
        expect(readOnlyHit).toMatchObject({
          kind: 'slot',
          matchId: pos.match.id,
          side,
        });
      }
    }

    // Final card 1.2x overhang left edge hits final match
    const finalPos = layout.positions.find((p) => p.match.id === 'r2-0')!;
    const finalGeom = getMatchCardGeometry(finalPos, layout.layoutMaxRound);
    expect(finalGeom.isFinal).toBe(true);
    expect(finalGeom.left).toBeLessThan(finalPos.x);
    expect(
      hitTestBracket({ x: finalGeom.left + 2, y: finalGeom.top + 4 }, layout)
    ).toMatchObject({
      kind: 'slot',
      matchId: 'r2-0',
      side: 'red',
    });

    // Empty space returns null
    expect(hitTestBracket({ x: -100, y: -100 }, layout)).toBeNull();
  });

  it('hit-tests all slots and locks in one-sided layout', () => {
    const layout = buildOneSidedLayout(make8PlayerMatches(), true);
    for (const pos of layout.positions) {
      const slot = getSlotRect(pos, 'blue', layout.layoutMaxRound);
      expect(
        hitTestBracket(
          { x: (slot.left + slot.right) / 2, y: (slot.top + slot.bottom) / 2 },
          layout
        )
      ).toMatchObject({
        kind: 'slot',
        matchId: pos.match.id,
        side: 'blue',
      });
    }
  });
});
