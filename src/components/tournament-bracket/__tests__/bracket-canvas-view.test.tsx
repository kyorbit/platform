// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';
import { BracketCanvasView } from '../bracket-canvas-view';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import { setupUiSdkJsdom } from '@/test/ui-sdk-setup';

setupUiSdkJsdom();

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

const sampleMatches = [
  makeMatch('m0', 0, 0),
  makeMatch('m1', 0, 1),
  makeMatch('m2', 1, 0),
];

const emptyAthletes = new Map<string, TournamentAthlete>();
const matchLabels = new Map<string, number | null>([
  ['m0', 101],
  ['m1', 102],
  ['m2', 103],
]);

describe('BracketCanvasView', () => {
  it('renders canvas and semantic slots and exposes actions to the agent bridge', async () => {
    const agent = createAgent();
    const onSlotClick = vi.fn();
    const onToggleLock = vi.fn();
    const onLayoutModeChange = vi.fn();

    render(
      <BracketCanvasView
        matches={sampleMatches}
        thirdPlaceMatch={false}
        athleteMap={emptyAthletes}
        matchLabel={matchLabels}
        readOnly={false}
        defaultLayoutMode="two-sided"
        onLayoutModeChange={onLayoutModeChange}
        onSlotClick={onSlotClick}
        onToggleLock={onToggleLock}
      />
    );

    expect(
      screen.getByRole('region', { name: 'Tournament bracket' })
    ).toBeTruthy();
    expect(document.querySelector('canvas[data-bracket-canvas]')).toBeTruthy();

    const snapshot = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== 'more');
    const bracketEntry = snapshot.find(
      (entry) => entry.component === 'tournament-bracket'
    );
    expect(bracketEntry?.label).toBe('Tournament bracket');
    expect(bracketEntry?.actions).toContain('setLayoutMode');
    expect(bracketEntry?.actions).toContain('selectMatch');
    expect(bracketEntry?.actions).toContain('toggleSlotLock');

    const result = await agent.act({
      steps: [
        {
          ref: 'Tournament bracket',
          action: 'setLayoutMode',
          args: ['one-sided'],
        },
        {
          ref: 'Tournament bracket',
          action: 'selectMatch',
          args: ['m2'],
        },
        {
          ref: 'Tournament bracket',
          action: 'toggleSlotLock',
          args: ['m0', 'red', true],
        },
      ],
    });

    expect(result.ok, result.error?.message).toBe(true);
    expect(onLayoutModeChange).toHaveBeenCalledWith('one-sided');
    expect(onSlotClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'm2' })
    );
    expect(onToggleLock).toHaveBeenCalledWith('m0', 'red', true);
  });
});
