// @vitest-environment jsdom
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';
import { BracketCanvasView } from '../bracket-canvas-view';
import type { BracketCanvasHandle } from '../bracket-canvas-view';
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

  it('clears focused/selected state when clicking empty canvas or outside the canvas, but keeps it when clicking the same node or panning', () => {
    const onSlotClick = vi.fn();
    const onToggleLock = vi.fn();
    const onSelectedMatchIdChange = vi.fn();
    const canvasRef = React.createRef<BracketCanvasHandle>();

    function ControlledBracket() {
      const [selectedMatchId, setSelectedMatchId] = React.useState<
        string | null
      >('m0');
      return (
        <div>
          <button type="button">Outside control</button>
          <BracketCanvasView
            canvasRef={canvasRef}
            matches={sampleMatches}
            thirdPlaceMatch={false}
            athleteMap={emptyAthletes}
            matchLabel={matchLabels}
            readOnly={false}
            defaultLayoutMode="one-sided"
            selectedMatchId={selectedMatchId}
            onSelectedMatchIdChange={(next, details) => {
              onSelectedMatchIdChange(next, details);
              setSelectedMatchId(next);
            }}
            onSlotClick={(match) => {
              onSlotClick(match);
              setSelectedMatchId(match.id);
            }}
            onToggleLock={onToggleLock}
          />
        </div>
      );
    }

    render(<ControlledBracket />);

    const canvas = document.querySelector(
      'canvas[data-bracket-canvas]'
    ) as HTMLCanvasElement;
    expect(canvas).toBeTruthy();

    const surface = canvas.parentElement!;
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 1200,
      bottom: 800,
      width: 1200,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const m0Slot = screen.getByRole('button', {
      name: /^Match 101 red corner/i,
    });
    expect(m0Slot.getAttribute('aria-pressed')).toBe('true');

    let m0Point: { x: number; y: number } | null = null;
    for (let x = 20; x <= 400 && !m0Point; x += 20) {
      for (let y = 20; y <= 400 && !m0Point; y += 15) {
        const hit = canvasRef.current?.hitTestClient(x, y);
        if (hit?.kind === 'slot' && hit.matchId === 'm0') {
          m0Point = { x, y };
        }
      }
    }
    expect(m0Point).not.toBeNull();

    act(() => {
      fireEvent.pointerDown(canvas, {
        button: 0,
        pointerId: 1,
        clientX: m0Point!.x,
        clientY: m0Point!.y,
      });
      fireEvent.pointerUp(canvas, {
        button: 0,
        pointerId: 1,
        clientX: m0Point!.x,
        clientY: m0Point!.y,
      });
    });
    expect(m0Slot.getAttribute('aria-pressed')).toBe('true');

    act(() => {
      fireEvent.pointerDown(canvas, {
        button: 0,
        pointerId: 2,
        clientX: 1,
        clientY: 1,
      });
      fireEvent.pointerMove(canvas, {
        button: 0,
        pointerId: 2,
        clientX: 60,
        clientY: 60,
      });
      fireEvent.pointerUp(canvas, {
        button: 0,
        pointerId: 2,
        clientX: 60,
        clientY: 60,
      });
    });
    expect(m0Slot.getAttribute('aria-pressed')).toBe('true');

    act(() => {
      fireEvent.pointerDown(canvas, {
        button: 0,
        pointerId: 3,
        clientX: 1,
        clientY: 1,
      });
      fireEvent.pointerUp(canvas, {
        button: 0,
        pointerId: 3,
        clientX: 1,
        clientY: 1,
      });
    });
    expect(m0Slot.getAttribute('aria-pressed')).toBe('false');
    expect(onSelectedMatchIdChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'outside-press' })
    );

    act(() => {
      fireEvent.click(m0Slot);
    });
    expect(m0Slot.getAttribute('aria-pressed')).toBe('true');

    const outsideButton = screen.getByRole('button', {
      name: 'Outside control',
    });
    act(() => {
      fireEvent.pointerDown(outsideButton, { button: 0, pointerId: 4 });
    });
    expect(m0Slot.getAttribute('aria-pressed')).toBe('false');
  });
});
