// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { DivisionsTab } from '..';
import type { DivisionData } from '@/contracts/tournament/division';
import {
  HeaderActionsProvider,
  HeaderActionsSlot,
} from '@/features/dashboard/components/tournament/builder/builder-shell/header-actions';
import { SheetContent, SheetTrigger } from '@/components/ui/sheet';

vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => true,
}));

vi.mock('@/features/dashboard/hooks/use-builder-manager-query', () => ({
  useBuilderManagerQuery: () => ({
    selectedDivisionId: 'd-1',
    setSelectedDivision: vi.fn(),
    addAthletes: null,
    setAddAthletes: vi.fn(),
  }),
}));

vi.mock('@/queries/division', () => ({
  useAssignAthlete: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('../athlete-pool', () => ({
  AthletePool: () => (
    <div>
      Unassigned Athletes
      <SheetTrigger render={<button>Add from library</button>} />
    </div>
  ),
}));

vi.mock('../add-athletes-sheet', () => ({
  AddAthletesSheet: ({ open }: { open: boolean }) =>
    open ? <SheetContent>Athlete library</SheetContent> : null,
}));

vi.mock('../division-roster-table', () => ({
  DivisionRosterTable: () => <div>Roster</div>,
}));

vi.mock('../divisions-rail', () => ({
  DivisionsRail: ({
    divisions,
    prepareSettingsDivision,
  }: {
    divisions: Array<DivisionData>;
    prepareSettingsDivision: (d: DivisionData) => void;
  }) => (
    <div>
      Rail
      <SheetTrigger
        render={
          <button onClick={() => prepareSettingsDivision(divisions[0]!)}>
            Division settings
          </button>
        }
      />
    </div>
  ),
}));

vi.mock('../../dialogs/division-settings-sheet', () => ({
  DivisionSettingsSheet: ({ division }: { division: DivisionData | null }) =>
    division ? <SheetContent>Settings for {division.name}</SheetContent> : null,
}));

vi.mock('../../dialogs/add-division-dialog', () => ({
  AddDivisionDialog: () => null,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const divisions = [{ id: 'd-1', name: 'U12 Male' }] as Array<DivisionData>;

function renderTab(isDesktop: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches: isDesktop,
    addEventListener() {},
    removeEventListener() {},
  }));
  render(
    <HeaderActionsProvider>
      <header data-testid="header">
        <HeaderActionsSlot />
      </header>
      <DivisionsTab
        tournamentId="t-1"
        tournamentName="Spring Open"
        divisions={divisions}
        readOnly={false}
      />
    </HeaderActionsProvider>
  );
  return within(screen.getByTestId('header'));
}

describe('DivisionsTab panes', () => {
  it('keeps the pool and rail inline on desktop with no header buttons', () => {
    const header = renderTab(true);

    expect(screen.getByText('Unassigned Athletes')).toBeTruthy();
    expect(screen.getByText('Rail')).toBeTruthy();
    expect(header.queryAllByRole('button')).toHaveLength(0);
  });

  it('opens the pool as a sheet from the header below lg', async () => {
    const header = renderTab(false);

    expect(screen.getByText('Roster')).toBeTruthy();
    expect(screen.queryByText('Unassigned Athletes')).toBeNull();

    fireEvent.click(header.getByRole('button', { name: 'Athlete pool' }));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByText('Unassigned Athletes')).toBeTruthy();
  });

  it('still opens the athlete library from inside the pool sheet', async () => {
    const header = renderTab(false);

    fireEvent.click(header.getByRole('button', { name: 'Athlete pool' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Add from library' })
    );

    expect(await screen.findByText('Athlete library')).toBeTruthy();
  });

  it('opens division settings from inside the rail sheet', async () => {
    const header = renderTab(false);

    expect(screen.queryByText('Rail')).toBeNull();
    fireEvent.click(header.getByRole('button', { name: 'Division list' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Division settings' })
    );

    expect(await screen.findByText('Settings for U12 Male')).toBeTruthy();
  });
});
