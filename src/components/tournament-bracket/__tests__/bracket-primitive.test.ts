// @vitest-environment jsdom
import { checkDirection, checkServer, mount } from '@ui-sdk/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { bracketPrimitive, slotKey } from '../bracket-primitive';
import type { Match } from '@/contracts/matches/dto';
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

const sampleMarkup = `
<root aria-label="Tournament bracket">
  <surface>
    <slot value="${slotKey('m0', 'red')}" matchId="m0" side="red" round="0" matchIndex="0" wing="left">Match 1 Red</slot>
    <slot value="${slotKey('m0', 'blue')}" matchId="m0" side="blue" round="0" matchIndex="0" wing="left">Match 1 Blue</slot>
    <slot value="${slotKey('m1', 'red')}" matchId="m1" side="red" round="0" matchIndex="1" wing="right">Match 2 Red</slot>
    <slot value="${slotKey('m2', 'red')}" matchId="m2" side="red" round="1" matchIndex="0" wing="center">Final Red</slot>
  </surface>
</root>
`;

describe('bracketPrimitive', () => {
  it('moves roving focus with arrow keys and selects on Enter', async () => {
    const onSelectMatch = vi.fn();
    const view = mount(
      bracketPrimitive,
      { matches: sampleMatches, defaultLayoutMode: 'two-sided', onSelectMatch },
      sampleMarkup
    );
    try {
      await view.keys('Tab', 'ArrowDown', 'Enter');
      expect(view.state.selectedMatchId).toBe('m0');
      expect(onSelectMatch).toHaveBeenCalledTimes(1);

      await view.keys('ArrowRight', 'Enter');
      expect(view.state.selectedMatchId).toBe('m2');
    } finally {
      view.unmount();
    }
  });

  it('toggles slot lock on L only when not readOnly', async () => {
    const onToggleLock = vi.fn();
    const view = mount(
      bracketPrimitive,
      { matches: sampleMatches, readOnly: false, onToggleLock },
      sampleMarkup
    );
    try {
      await view.keys('Tab', 'l');
      expect(onToggleLock).toHaveBeenCalledWith('m0', 'red', true);
    } finally {
      view.unmount();
    }

    const onToggleLockRO = vi.fn();
    const roView = mount(
      bracketPrimitive,
      { matches: sampleMatches, readOnly: true, onToggleLock: onToggleLockRO },
      sampleMarkup
    );
    try {
      await roView.keys('Tab', 'l');
      expect(onToggleLockRO).not.toHaveBeenCalled();
    } finally {
      roView.unmount();
    }
  });

  it('supports controlled layoutMode switching between two-sided and one-sided', () => {
    const onLayoutModeChange = vi.fn();
    const view = mount(
      bracketPrimitive,
      {
        matches: sampleMatches,
        defaultLayoutMode: 'two-sided',
        onLayoutModeChange,
      },
      sampleMarkup
    );
    try {
      expect(view.state.layoutMode).toBe('two-sided');
      view.api.setLayoutMode('one-sided');
      expect(view.state.layoutMode).toBe('one-sided');
      expect(onLayoutModeChange).toHaveBeenCalledWith(
        'one-sided',
        expect.objectContaining({ reason: 'layout-toggle' })
      );
    } finally {
      view.unmount();
    }
  });

  it('renders cleanly on the server and works in both LTR and RTL directions', async () => {
    checkServer(bracketPrimitive, { matches: sampleMatches }, sampleMarkup);
    await checkDirection(
      bracketPrimitive,
      { matches: sampleMatches },
      sampleMarkup
    );
  });

  it('clears selection and focus on outside pointerdown except on the active node', async () => {
    const onSelectedMatchIdChange = vi.fn();
    const view = mount(
      bracketPrimitive,
      { matches: sampleMatches, onSelectedMatchIdChange },
      sampleMarkup
    );
    try {
      await view.keys('Tab', 'Enter');
      expect(view.state.selectedMatchId).toBe('m0');

      const sameNodeBlueSlot = view.root.querySelector(
        '[data-slot="tournament-bracket-slot"][data-match-id="m0"][data-side="blue"]'
      );
      expect(sameNodeBlueSlot).toBeTruthy();
      sameNodeBlueSlot!.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, button: 0 })
      );
      expect(view.state.selectedMatchId).toBe('m0');

      const outside = document.createElement('button');
      document.body.appendChild(outside);
      try {
        outside.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, button: 0 })
        );
        expect(view.state.selectedMatchId).toBeNull();
        expect(view.state.focusedSlotKey).toBeNull();
        expect(onSelectedMatchIdChange).toHaveBeenLastCalledWith(
          null,
          expect.objectContaining({ reason: 'outside-press' })
        );
      } finally {
        outside.remove();
      }
    } finally {
      view.unmount();
    }
  });
});
