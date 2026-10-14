// @vitest-environment jsdom

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BracketToolbar } from '@/features/dashboard/components/tournament/builder/brackets-tab/bracket-toolbar';
import { AthleteImportDialog } from '@/features/dashboard/components/athlete/dialogs/athlete-import-dialog';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';

const mocks = vi.hoisted(() => ({
  bracket: {
    selectedDivisionId: 'division-1',
    toolbarDisabled: false,
    readOnly: false,
    tournamentStatus: 'draft',
    matches: [
      {
        id: 'match-1',
        kind: 'bracket',
        round: 0,
        status: 'pending',
        redWins: 0,
        blueWins: 0,
        tournamentWinnerId: null,
        redTournamentAthleteId: 'athlete-1',
        blueTournamentAthleteId: 'athlete-2',
      },
    ],
    athletes: [
      { id: 'athlete-1', name: 'Alice' },
      { id: 'athlete-2', name: 'Bob' },
    ],
    matchLabel: () => 'Match 1',
  },
  createMatch: vi.fn(() => Promise.resolve({ id: 'custom-match-1' })),
  createAthlete: vi.fn(() => Promise.resolve({ id: 'profile-1' })),
  successToast: vi.fn(),
  warningToast: vi.fn(),
}));

vi.mock(
  '@/features/dashboard/contexts/tournament-bracket/use-tournament-bracket',
  () => ({
    useTournamentBracket: () => mocks.bracket,
  })
);

vi.mock('@/queries/match', () => ({
  useCreateCustomMatch: () => ({
    mutateAsync: mocks.createMatch,
    isPending: false,
  }),
  useShuffleBracket: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRegenerateBracket: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useResetBracket: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/orpc/client', () => ({
  client: { athleteProfile: { create: mocks.createAthlete } },
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.successToast,
    warning: mocks.warningToast,
    promise: vi.fn(),
  },
}));

beforeAll(() => {
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      readonly pointerType = 'mouse';
    }
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.scrollIntoView = () => {};
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.bracket.readOnly = false;
  mocks.bracket.toolbarDisabled = false;
  mocks.bracket.tournamentStatus = 'draft';
});

afterEach(cleanup);

function activate(element: HTMLElement) {
  fireEvent.pointerDown(element, { button: 0, ctrlKey: false });
  fireEvent.mouseDown(element, { button: 0 });
  fireEvent.pointerUp(element, { button: 0 });
  fireEvent.mouseUp(element, { button: 0 });
  fireEvent.click(element);
}

function renderImport() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  render(
    <QueryClientProvider client={queryClient}>
      <AthleteImportDialog>
        <DialogTrigger render={<Button variant="outline">Import</Button>} />
      </AthleteImportDialog>
    </QueryClientProvider>
  );
  return invalidate;
}

function chooseFile(dialog: HTMLElement, file: File) {
  const input = dialog.querySelector('input[type="file"]');
  if (!input) throw new Error('Import file input is missing');
  fireEvent.change(input, { target: { files: [file] } });
}

function athleteCSV() {
  const content =
    'athlete_code,name,gender,belt_level,weight,affiliation\nA001,Alice,F,2,55,Club A';
  const file = new File([content], 'athletes.csv', { type: 'text/csv' });
  Object.defineProperty(file, 'arrayBuffer', {
    value: () => Promise.resolve(new TextEncoder().encode(content).buffer),
  });
  return file;
}

describe('custom match trigger', () => {
  it.each(['Escape', 'Cancel'])(
    'restores focus and resets the form after %s',
    async (dismiss) => {
      render(<BracketToolbar />);
      const trigger = screen.getByRole('button', {
        name: 'Create custom match',
      });
      trigger.focus();
      activate(trigger);
      await screen.findByRole('dialog', { name: 'Custom match' });
      const label = screen.getByPlaceholderText('e.g. Exhibition A');
      fireEvent.change(label, { target: { value: 'Exhibition A' } });
      if (dismiss === 'Cancel') {
        activate(screen.getByRole('button', { name: 'Cancel' }));
      } else {
        fireEvent.keyDown(label, { key: 'Escape' });
      }
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(trigger));
      activate(trigger);
      await screen.findByRole('dialog', { name: 'Custom match' });
      expect(
        screen.getByPlaceholderText('e.g. Exhibition A').getAttribute('value')
      ).toBe('');
    }
  );

  it.each([
    { readOnly: true, status: 'draft' },
    { readOnly: false, status: 'completed' },
  ])(
    'keeps the custom match trigger disabled for $status, readOnly=$readOnly',
    ({ readOnly, status }) => {
      mocks.bracket.readOnly = readOnly;
      mocks.bracket.tournamentStatus = status;
      render(<BracketToolbar />);
      const trigger = screen.getByRole('button', {
        name: 'Create custom match',
      });
      expect(trigger.hasAttribute('disabled')).toBe(true);
      activate(trigger);
      expect(screen.queryByRole('dialog')).toBeNull();
    }
  );

  it('closes after creating a match and starts the next creation with a blank form', async () => {
    render(<BracketToolbar />);
    const trigger = screen.getByRole('button', { name: 'Create custom match' });
    activate(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Custom match' });
    fireEvent.change(screen.getByPlaceholderText('e.g. Exhibition A'), {
      target: { value: 'Exhibition A' },
    });
    const athleteSelects = within(dialog).getAllByRole('combobox', {
      name: 'Athlete',
    });
    const [redSelect, blueSelect] = athleteSelects;
    if (!redSelect || !blueSelect)
      throw new Error('Athlete selectors are missing');
    activate(redSelect);
    activate(await screen.findByRole('option', { name: 'Alice' }));
    activate(blueSelect);
    activate(await screen.findByRole('option', { name: 'Bob' }));
    activate(within(dialog).getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(mocks.createMatch).toHaveBeenCalledWith({
        divisionId: 'division-1',
        displayLabel: 'Exhibition A',
        red: { mode: 'direct', tournamentAthleteId: 'athlete-1' },
        blue: { mode: 'direct', tournamentAthleteId: 'athlete-2' },
      })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    activate(trigger);
    await screen.findByRole('dialog', { name: 'Custom match' });
    expect(
      screen.getByPlaceholderText('e.g. Exhibition A').getAttribute('value')
    ).toBe('');
  });
});

describe('athlete import trigger', () => {
  it('clears a parse error on dismissal and restores focus to Import', async () => {
    renderImport();
    const trigger = screen.getByRole('button', { name: 'Import' });
    trigger.focus();
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Import Athletes',
    });
    chooseFile(
      dialog,
      new File(['invalid'], 'athletes.txt', { type: 'text/plain' })
    );
    await screen.findByText(/Unsupported file type/);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    activate(trigger);
    await screen.findByRole('dialog', { name: 'Import Athletes' });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'Import 0 Athletes' })
        .hasAttribute('disabled')
    ).toBe(true);
  });

  it('clears the parsed preview when closed without importing', async () => {
    renderImport();
    const trigger = screen.getByRole('button', { name: 'Import' });
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Import Athletes',
    });
    chooseFile(dialog, athleteCSV());
    await screen.findByText('Found 1 athlete to import.');
    activate(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    activate(trigger);
    await screen.findByRole('dialog', { name: 'Import Athletes' });
    expect(screen.queryByText('Found 1 athlete to import.')).toBeNull();
    expect(mocks.createAthlete).not.toHaveBeenCalled();
  });

  it('imports a real parsed CSV, invalidates the list, closes, and resets for the next import', async () => {
    const invalidate = renderImport();
    const trigger = screen.getByRole('button', { name: 'Import' });
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Import Athletes',
    });
    chooseFile(dialog, athleteCSV());
    await screen.findByText('Found 1 athlete to import.');
    activate(screen.getByRole('button', { name: 'Import 1 Athletes' }));
    await waitFor(() =>
      expect(mocks.createAthlete).toHaveBeenCalledWith({
        athleteCode: 'A001',
        name: 'Alice',
        gender: 'F',
        beltLevel: 2,
        weight: 55,
        affiliation: 'Club A',
        confirmDuplicate: true,
      })
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['athleteProfile'] });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(mocks.successToast).toHaveBeenCalledWith('Imported 1 athletes');
    activate(trigger);
    await screen.findByRole('dialog', { name: 'Import Athletes' });
    expect(screen.queryByText('Found 1 athlete to import.')).toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'Import 0 Athletes' })
        .hasAttribute('disabled')
    ).toBe(true);
  });
});
