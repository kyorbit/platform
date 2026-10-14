// @vitest-environment jsdom

import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AddAthletesList } from '../add-athletes-list';
import type { AthleteProfileData } from '@/contracts/athlete/profile';
import { LoadMore } from '@/components/async/load-more';
import { useAddAthletesSheet } from '@/features/dashboard/hooks/use-add-athletes-sheet';
import { listAthleteProfiles } from '@/queries/api/athlete-profile-api';

vi.mock('@/queries/api/athlete-profile-api', () => ({
  listAthleteProfiles: vi.fn(),
}));
vi.mock('@/queries/api/tournament-athlete-api', () => ({
  bulkAddTournamentAthletes: vi.fn(),
}));

const observers = new Set<TestIntersectionObserver>();

class TestIntersectionObserver implements IntersectionObserver {
  readonly root;
  readonly rootMargin;
  readonly scrollMargin = '0px';
  readonly thresholds = [0];
  readonly targets = new Set<Element>();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? '0px';
    observers.add(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
    observers.delete(this);
  }
  takeRecords() {
    return [];
  }

  intersect(isIntersecting = true) {
    const entries = [...this.targets].map((target) => ({
      target,
      isIntersecting,
      time: performance.now(),
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1 : 0,
      rootBounds: null,
    }));
    this.callback(entries, this);
  }
}

function intersect(isIntersecting = true) {
  act(() =>
    [...observers].forEach((observer) => observer.intersect(isIntersecting))
  );
}

function athlete(index: number): AthleteProfileData {
  return {
    id: `athlete-${index}`,
    athleteCode: `A${index}`,
    name: `Athlete ${index}`,
    gender: 'M',
    beltLevel: 1,
    weight: 50,
    affiliation: 'Test club',
    image: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

const athletes = Array.from({ length: 90 }, (_, index) => athlete(index));
const clients = new Set<QueryClient>();

function SheetList({ open = true }: { open?: boolean }) {
  const sheet = useAddAthletesSheet({
    open,
    onOpenChange: () => {},
    tournamentId: 'test-tournament',
    readOnly: false,
  });
  return (
    <>
      <button onClick={() => sheet.filters.setGender('F')}>Filter women</button>
      <button onClick={sheet.selection.toggleSelectAllShown}>
        Select all shown
      </button>
      <output>
        {sheet.list.items.length} loaded, {sheet.selection.selectedCount}{' '}
        selected
      </output>
      <AddAthletesList
        list={sheet.list}
        virtual={sheet.virtual}
        selectedIds={sheet.selection.selectedIds}
        onToggleProfile={sheet.selection.toggleProfile}
      />
    </>
  );
}

function renderSheet() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  clients.add(client);
  const view = render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <SheetList />
      </QueryClientProvider>
    </StrictMode>
  );
  return { ...view, client };
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.dataset.index ? 76 : 400;
    }
  );
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(480);
  vi.mocked(listAthleteProfiles).mockImplementation((input) =>
    Promise.resolve({
      items: input.excludeTournamentId
        ? athletes.slice(
            (input.page - 1) * input.perPage,
            input.page * input.perPage
          )
        : athletes.slice(0, 1),
      total: athletes.length,
    })
  );
});

afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.clear();
  observers.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.mocked(listAthleteProfiles).mockReset();
});

describe('virtual athlete list with LoadMore', () => {
  it('loads at the footer, keeps rendering bounded, and retains selection across pages', async () => {
    const { container } = renderSheet();
    await screen.findByText('30 loaded, 0 selected');
    const scroller = container.querySelector('.overflow-y-auto');
    const spacer = scroller?.firstElementChild;
    if (!(spacer instanceof HTMLElement))
      throw new Error('Missing virtual spacer');
    const initialHeight = Number.parseFloat(spacer.style.height);
    expect([...observers][0]?.root).toBe(scroller);
    expect(container.querySelectorAll('[data-index]').length).toBeGreaterThan(
      0
    );
    expect(container.querySelectorAll('[data-index]').length).toBeLessThan(30);
    expect(
      vi
        .mocked(listAthleteProfiles)
        .mock.calls.filter(([input]) => input.page === 2)
    ).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Select all shown' }));
    intersect();
    await screen.findByText('60 loaded, 30 selected');
    const appendedHeight = Number.parseFloat(spacer.style.height);
    expect(appendedHeight).toBeGreaterThan(initialHeight);
    expect(container.querySelectorAll('[data-index]').length).toBeLessThan(30);
    intersect();
    await screen.findByText('90 loaded, 30 selected');
    expect(
      screen
        .getByRole('button', { name: 'No more athletes' })
        .getAttribute('aria-disabled')
    ).toBe('true');
    expect(
      vi
        .mocked(listAthleteProfiles)
        .mock.calls.filter(([input]) => input.excludeTournamentId)
        .map(([input]) => input.page)
    ).toEqual([1, 2, 3]);
  });

  it('shows retry after a failed page and ignores repeated triggers while fetching', async () => {
    renderSheet();
    await screen.findByText('30 loaded, 0 selected');
    let rejectPage: (error: Error) => void = () => {};
    vi.mocked(listAthleteProfiles).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectPage = reject;
        })
    );
    intersect();
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Loading' })
          .getAttribute('aria-busy')
      ).toBe('true')
    );
    const calls = vi.mocked(listAthleteProfiles).mock.calls.length;
    intersect();
    fireEvent.click(screen.getByRole('button', { name: 'Loading' }));
    expect(vi.mocked(listAthleteProfiles).mock.calls).toHaveLength(calls);
    await act(() => rejectPage(new Error('Page unavailable')));
    const retry = await screen.findByRole('button', {
      name: 'Couldn’t load. Try again',
    });
    intersect();
    expect(vi.mocked(listAthleteProfiles).mock.calls).toHaveLength(calls);
    fireEvent.click(retry);
    await screen.findByText('60 loaded, 0 selected');
  });

  it('resets scroll and error state on filters and cannot paginate placeholder rows', async () => {
    const { container } = renderSheet();
    await screen.findByText('30 loaded, 0 selected');
    vi.mocked(listAthleteProfiles).mockRejectedValueOnce(
      new Error('Page unavailable')
    );
    intersect();
    await screen.findByRole('button', { name: 'Couldn’t load. Try again' });
    const scroller = container.querySelector('.overflow-y-auto');
    if (!(scroller instanceof HTMLElement)) throw new Error('Missing scroller');
    scroller.scrollTop = 1000;
    let resolveFilter: (
      result: Awaited<ReturnType<typeof listAthleteProfiles>>
    ) => void = () => {};
    vi.mocked(listAthleteProfiles).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFilter = resolve;
        })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filter women' }));
    await waitFor(() => expect(observers.size).toBe(0));
    expect(scroller.scrollTop).toBe(0);
    expect(
      screen.queryByRole('button', { name: 'Couldn’t load. Try again' })
    ).toBeNull();
    const calls = vi.mocked(listAthleteProfiles).mock.calls.length;
    intersect();
    expect(vi.mocked(listAthleteProfiles).mock.calls).toHaveLength(calls);
    await act(() => resolveFilter({ items: [athlete(100)], total: 1 }));
    await screen.findByText('1 loaded, 0 selected');
    expect(
      screen
        .getByRole('button', { name: 'No more athletes' })
        .getAttribute('aria-disabled')
    ).toBe('true');
  });

  it('disables the footer while a background refresh is running', async () => {
    const { client } = renderSheet();
    await screen.findByText('30 loaded, 0 selected');
    let resolveRefresh: (
      result: Awaited<ReturnType<typeof listAthleteProfiles>>
    ) => void = () => {};
    vi.mocked(listAthleteProfiles).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );
    act(() => {
      void client.invalidateQueries({
        predicate: (query) => query.queryKey.includes('infinite'),
      });
    });
    await waitFor(() => expect(observers.size).toBe(0));
    const button = screen.getByRole('button', { name: 'Load more' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    const calls = vi.mocked(listAthleteProfiles).mock.calls.length;
    fireEvent.click(button);
    expect(vi.mocked(listAthleteProfiles).mock.calls).toHaveLength(calls);
    await act(() =>
      resolveRefresh({ items: athletes.slice(0, 30), total: 90 })
    );
    await waitFor(() => expect(observers.size).toBe(1));
  });
});

describe('LoadMore automatic loading limit', () => {
  it('pauses after three consecutive loads and resumes on a manual click', async () => {
    const onLoad = vi.fn(() => Promise.resolve(true));
    render(<LoadMore onLoad={onLoad} />);
    for (let count = 1; count <= 3; count += 1) {
      intersect();
      await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(count));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Load more' })).toBeTruthy()
      );
    }
    intersect();
    expect(onLoad).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(4));
  });
});
