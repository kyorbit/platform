// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Toaster } from 'sonner';
import { BracketToolbar } from '../bracket-toolbar';

const bracket = vi.hoisted(() => ({
  selectedDivisionId: 'division-1' as string | null,
  readOnly: false,
  tournamentStatus: 'draft',
  matches: [] as Array<object>,
  athletes: [],
  matchLabel: () => 'Match 1',
}));

vi.mock(
  '@/features/dashboard/contexts/tournament-bracket/use-tournament-bracket',
  () => ({ useTournamentBracket: () => bracket })
);

vi.mock('@/queries/match', () => ({
  useCreateCustomMatch: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useShuffleBracket: () => ({ mutateAsync: vi.fn(), status: 'idle' }),
  useRegenerateBracket: () => ({ mutateAsync: vi.fn(), status: 'idle' }),
  useResetBracket: () => ({ mutateAsync: vi.fn(), status: 'idle' }),
}));

const match = {
  id: 'match-1',
  kind: 'bracket',
  round: 0,
  status: 'pending',
  redWins: 0,
  blueWins: 0,
  tournamentWinnerId: null,
  redTournamentAthleteId: 'athlete-1',
  blueTournamentAthleteId: 'athlete-2',
};

beforeAll(() => {
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      readonly pointerType = 'touch';
    }
  );
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(cleanup);

function tap(element: HTMLElement) {
  fireEvent.pointerDown(element, { button: 0 });
  fireEvent.pointerUp(element, { button: 0 });
  fireEvent.click(element);
}

function renderToolbar(state: Partial<typeof bracket>) {
  Object.assign(bracket, {
    selectedDivisionId: 'division-1',
    readOnly: false,
    tournamentStatus: 'draft',
    matches: [match],
    ...state,
  });
  render(
    <>
      <BracketToolbar />
      <Toaster />
    </>
  );
  return screen.getByRole('button', { name: 'Create custom match' });
}

describe('Create custom match button', () => {
  it.each([
    { state: { selectedDivisionId: null }, reason: 'Select a division' },
    { state: { matches: [] }, reason: 'Generate a bracket first' },
    {
      state: { tournamentStatus: 'completed' },
      reason: 'Tournament completed',
    },
    { state: { readOnly: true }, reason: 'Read-only mode' },
  ])('shows $reason when tapped while blocked', async ({ state, reason }) => {
    tap(renderToolbar(state));

    expect(await screen.findByText(reason)).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens the custom match dialog when unblocked', async () => {
    tap(renderToolbar({}));

    expect(
      await screen.findByRole('dialog', { name: 'Custom match' })
    ).toBeTruthy();
  });
});
