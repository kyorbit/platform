// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { useDroppable } from '@dnd-kit/core';
import { DivisionsTab } from '..';
import { AthletePoolRow } from '../athlete-pool/athlete-pool-row';
import type {
  DivisionData,
  TournamentAthleteData,
} from '@/contracts/tournament/division';
import {
  BuilderFooterProvider,
  BuilderFooterSlot,
} from '@/features/dashboard/components/tournament/builder/builder-shell/footer-portal';
import { SheetContent, SheetTrigger } from '@/components/ui/sheet';

const assign = vi.hoisted(() => vi.fn(() => Promise.resolve()));

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
  useAssignAthlete: () => ({ mutateAsync: assign, status: 'idle' }),
}));

const athlete = {
  id: 'a-1',
  name: 'Mina Park',
  affiliation: 'Seoul TKD',
  beltLevel: 1,
  weight: 40,
  gender: 'F',
} as TournamentAthleteData;

vi.mock('../athlete-pool', () => ({
  AthletePool: () => (
    <div>
      Unassigned Athletes
      <SheetTrigger render={<button>Add from library</button>} />
      <AthletePoolRow
        athlete={athlete}
        selectedDivisionId="d-1"
        readOnly={false}
      />
    </div>
  ),
}));

vi.mock('../add-athletes-sheet', () => ({
  AddAthletesSheet: ({ open }: { open: boolean }) =>
    open ? <SheetContent>Athlete library</SheetContent> : null,
}));

vi.mock('../division-roster-table', () => ({
  DivisionRosterTable: () => {
    const { setNodeRef } = useDroppable({
      id: 'roster:d-1',
      data: { divisionId: 'd-1' },
    });
    return (
      <div ref={setNodeRef} data-testid="roster">
        Roster
      </div>
    );
  },
}));

vi.mock('../divisions-rail', () => ({
  DivisionsRail: ({
    divisions,
    onSelect,
    prepareSettingsDivision,
  }: {
    divisions: Array<DivisionData>;
    onSelect: (id: string) => void;
    prepareSettingsDivision: (d: DivisionData) => void;
  }) => (
    <div>
      Rail
      <button onClick={() => onSelect(divisions[0]!.id)}>
        {divisions[0]!.name}
      </button>
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
  vi.restoreAllMocks();
  assign.mockClear();
});

const divisions = [{ id: 'd-1', name: 'U12 Male' }] as Array<DivisionData>;

function renderTab(isDesktop: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches: isDesktop,
    addEventListener() {},
    removeEventListener() {},
  }));
  render(
    <BuilderFooterProvider>
      <footer data-testid="footer">
        <BuilderFooterSlot />
      </footer>
      <DivisionsTab
        tournamentId="t-1"
        tournamentName="Spring Open"
        divisions={divisions}
        readOnly={false}
      />
    </BuilderFooterProvider>
  );
  return within(screen.getByTestId('footer'));
}

/** jsdom has no layout: the roster sits right of a 300px pool. */
function stubLayout() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      const isRoster = this.getAttribute('data-testid') === 'roster';
      const [left, width, height] = isRoster ? [400, 400, 600] : [0, 300, 50];
      return {
        x: left,
        y: 0,
        left,
        top: 0,
        width,
        height,
        right: left + width,
        bottom: height,
        toJSON() {},
      };
    }
  );
}

describe('DivisionsTab panes', () => {
  it('keeps the pool and rail inline on desktop with no footer buttons', () => {
    const footer = renderTab(true);

    expect(screen.getByText('Unassigned Athletes')).toBeTruthy();
    expect(screen.getByText('Rail')).toBeTruthy();
    expect(footer.queryAllByRole('button')).toHaveLength(0);
  });

  it('opens the pool as a sheet from the footer below lg', async () => {
    const footer = renderTab(false);

    expect(screen.getByText('Roster')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(footer.getByRole('button', { name: 'Athlete pool' }));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByText('Unassigned Athletes')).toBeTruthy();
  });

  it('still opens the athlete library from inside the pool sheet', async () => {
    const footer = renderTab(false);

    fireEvent.click(footer.getByRole('button', { name: 'Athlete pool' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Add from library' })
    );

    expect(await screen.findByText('Athlete library')).toBeTruthy();
  });

  it('opens division settings from inside the rail sheet', async () => {
    const footer = renderTab(false);

    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(footer.getByRole('button', { name: 'Division list' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Division settings' })
    );

    expect(await screen.findByText('Settings for U12 Male')).toBeTruthy();
  });

  it('closes the rail sheet when a division is picked', async () => {
    const footer = renderTab(false);

    fireEvent.click(footer.getByRole('button', { name: 'Division list' }));
    const sheet = await screen.findByRole('dialog');
    fireEvent.click(within(sheet).getByRole('button', { name: 'U12 Male' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes the pool sheet on drag start and still drops on the roster', async () => {
    stubLayout();
    const footer = renderTab(false);

    fireEvent.click(footer.getByRole('button', { name: 'Athlete pool' }));
    const sheet = await screen.findByRole('dialog');
    const row = within(sheet).getByRole('button', { name: /Mina Park/ });

    fireEvent.mouseDown(row, { button: 0, clientX: 10, clientY: 10 });
    act(() => {
      fireEvent.mouseMove(document, { clientX: 30, clientY: 10 });
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    act(() => {
      fireEvent.mouseMove(document, { clientX: 510, clientY: 10 });
    });
    act(() => {
      fireEvent.mouseUp(document, { clientX: 510, clientY: 10 });
    });

    expect(assign).toHaveBeenCalledWith({
      divisionId: 'd-1',
      tournamentAthleteId: 'a-1',
    });
  });
});
