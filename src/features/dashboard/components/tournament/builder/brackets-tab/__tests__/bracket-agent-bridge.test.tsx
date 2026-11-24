// @vitest-environment jsdom
import React from 'react';
import { act, render } from '@testing-library/react';
import { Button } from '@ui-sdk/react/button';
import { createAgent, registerTools } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';
import { BracketLayoutToggle } from '../bracket-layout-toggle';
import { BracketViewToolbar } from '../bracket-view-toolbar';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import { setupUiSdkJsdom } from '@/test/ui-sdk-setup';
import { Bracket } from '@/components/tournament-bracket/bracket';
import { BracketChromeProvider } from '@/features/dashboard/contexts/bracket-chrome';

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

describe('bracket UI SDK agent bridge', () => {
  it('discovers all controls by unique name, drives 1-sided and 2-sided layouts, enforces confirm gates, and registers WebMCP tools', async () => {
    let approveConfirm = false;
    const agent = createAgent({
      allow: (step) => !step.confirm || approveConfirm,
    });

    const onSlotClick = vi.fn();
    const onToggleLock = vi.fn();
    const onAssignSlot = vi.fn();
    const onSwapSlots = vi.fn();
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onFit = vi.fn();
    const onRegenerate = vi.fn();

    function TestSurface() {
      const [layoutMode, setLayoutMode] = React.useState<
        'two-sided' | 'one-sided'
      >('two-sided');

      return (
        <BracketChromeProvider>
          <Bracket
            matches={sampleMatches}
            thirdPlaceMatch={false}
            athleteMap={emptyAthletes}
            matchLabel={matchLabels}
            readOnly={false}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
            onSlotClick={onSlotClick}
            onToggleLock={onToggleLock}
            onAssignSlot={onAssignSlot}
            onSwapSlots={onSwapSlots}
          />
          <BracketLayoutToggle value={layoutMode} onChange={setLayoutMode} />
          <BracketViewToolbar
            onFit={onFit}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
          />
          <Button
            type="button"
            data-agent-confirm="Deletes every match in this division and recreates an empty bracket shell"
            onClick={onRegenerate}
          >
            Regenerate bracket
          </Button>
        </BracketChromeProvider>
      );
    }

    render(<TestSurface />);

    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== 'more');

    for (const entry of components) {
      expect(
        entry.label,
        `${entry.component} ${entry.ref} has no name`
      ).toBeTruthy();
    }

    const labels = components.map((entry) => entry.label);
    for (const expected of [
      'Tournament bracket',
      'Bracket canvas layout',
      'Zoom in',
      'Zoom out',
      'Fit bracket to view',
      'Toggle bracket fullscreen',
      'Regenerate bracket',
    ]) {
      expect(labels, `${expected} missing from agent snapshot`).toContain(
        expected
      );
    }

    const bracketEntry = components.find(
      (entry) => entry.component === 'tournament-bracket'
    );
    expect(bracketEntry?.items?.length).toBe(3);

    const driveResult = await act(async () =>
      agent.act({
        steps: [
          {
            ref: 'Bracket canvas layout',
            action: 'setValue',
            args: ['One-sided layout'],
          },
          { ref: 'Zoom in', action: 'press' },
          { ref: 'Fit bracket to view', action: 'press' },
          { ref: 'Tournament bracket', action: 'selectMatch', args: ['m2'] },
          {
            ref: 'Tournament bracket',
            action: 'toggleSlotLock',
            args: ['m0', 'red', true],
          },
          {
            ref: 'Tournament bracket',
            action: 'assignSlot',
            args: ['m0', 'red', 'ta-1'],
          },
          {
            ref: 'Tournament bracket',
            action: 'swapSlots',
            args: ['m0', 'red', 'm1', 'blue'],
          },
        ],
      })
    );

    expect(driveResult.ok, driveResult.error?.message).toBe(true);
    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onFit).toHaveBeenCalledTimes(1);
    expect(onSlotClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'm2' })
    );
    expect(onToggleLock).toHaveBeenCalledWith('m0', 'red', true);
    expect(onAssignSlot).toHaveBeenCalledWith('m0', 'red', 'ta-1');
    expect(onSwapSlots).toHaveBeenCalledWith('m0', 'red', 'm1', 'blue');

    // Confirm gate refuses until approved
    const refused = await agent.act({
      steps: [{ ref: 'Regenerate bracket', action: 'press' }],
    });
    expect(refused.ok).toBe(false);
    expect(onRegenerate).not.toHaveBeenCalled();

    approveConfirm = true;
    const approved = await agent.act({
      steps: [{ ref: 'Regenerate bracket', action: 'press' }],
    });
    expect(approved.ok, approved.error?.message).toBe(true);
    expect(onRegenerate).toHaveBeenCalledTimes(1);

    // WebMCP registerTools smoke test
    const registered = new Map<
      string,
      { execute: (input: object) => Promise<unknown> }
    >();
    Object.assign(document, {
      modelContext: {
        registerTool: async (tool: {
          name: string;
          execute: (input: object) => Promise<unknown>;
        }) => {
          registered.set(tool.name, tool);
        },
      },
    });
    const unregister = registerTools(agent, { allow: () => true });
    expect(Array.from(registered.keys())).toEqual(
      expect.arrayContaining(['snapshot', 'query', 'act'])
    );
    expect(await registered.get('snapshot')!.execute({})).toBeInstanceOf(Array);
    unregister();
  });
});
