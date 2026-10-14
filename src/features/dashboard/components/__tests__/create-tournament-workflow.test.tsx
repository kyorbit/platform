// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/contexts/themes';
import { DashboardHome } from '@/features/dashboard/components/home/dashboard-home';
import { TournamentsOverview } from '@/features/dashboard/components/tournament/overview';
import { tournamentKeys } from '@/queries/keys';

const mocks = vi.hoisted(() => {
  const created = {
    id: 'created-tournament',
    name: 'New tournament',
    nameSortKey: 'new tournament',
    status: 'draft',
    arenaDivisionOrder: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return {
    created,
    create: vi.fn(() => Promise.resolve(created)),
    list: vi.fn(() => Promise.resolve({ items: [], total: 0 })),
    successToast: vi.fn(),
    errorToast: vi.fn(),
  };
});

vi.mock('@/orpc/client', () => ({
  client: { tournament: { create: mocks.create, list: mocks.list } },
}));
vi.mock('sonner', () => ({
  toast: { success: mocks.successToast, error: mocks.errorToast },
}));

beforeAll(() => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1440,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: 900,
  });
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal('scrollTo', () => {});
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
  window.localStorage.clear();
  mocks.create.mockImplementation(() => Promise.resolve(mocks.created));
});

const queryClients: Array<QueryClient> = [];
afterEach(() => {
  cleanup();
  for (const client of queryClients) client.clear();
  queryClients.length = 0;
});

function activate(element: HTMLElement) {
  fireEvent.pointerDown(element, { button: 0, ctrlKey: false });
  fireEvent.mouseDown(element, { button: 0 });
  fireEvent.pointerUp(element, { button: 0 });
  fireEvent.mouseUp(element, { button: 0 });
  fireEvent.click(element);
}

function renderPage(
  path = '/dashboard/tournaments',
  searchParams = '?view=grid'
) {
  const root = createRootRoute({
    component: () => (
      <ThemeProvider defaultTheme="light" storageKey="test-theme">
        <SidebarProvider>
          <Outlet />
        </SidebarProvider>
      </ThemeProvider>
    ),
  });
  const dashboard = createRoute({
    getParentRoute: () => root,
    path: '/dashboard',
    component: DashboardHome,
  });
  const overview = createRoute({
    getParentRoute: () => root,
    path: '/dashboard/tournaments',
    component: TournamentsOverview,
  });
  const builder = createRoute({
    getParentRoute: () => root,
    path: '/dashboard/tournaments/$id/builder',
    component: () => <h1>Tournament builder</h1>,
  });
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/dashboard/tournaments/$id',
    component: () => <h1>Tournament details</h1>,
  });
  const router = createRouter({
    routeTree: root.addChildren([dashboard, overview, builder, detail]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClients.push(queryClient);
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  render(
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter searchParams={searchParams} hasMemory>
        <RouterProvider router={router} />
      </NuqsTestingAdapter>
    </QueryClientProvider>
  );
  return { router, invalidate };
}

function submitForm(dialog: HTMLElement) {
  const form = dialog.querySelector('form');
  if (!form) throw new Error('Creation form is missing');
  fireEvent.submit(form);
}

describe('Create Tournament workflow', () => {
  it('opens from the dashboard, resets on close, and returns focus to its trigger', async () => {
    renderPage('/dashboard');
    const trigger = await screen.findByRole('button', {
      name: 'Create Tournament',
    });
    trigger.focus();
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Create Tournament',
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Tournament name'), {
      target: { value: 'Abandoned name' },
    });
    activate(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    activate(trigger);
    const reopened = await screen.findByRole('dialog', {
      name: 'Create Tournament',
    });
    expect(
      within(reopened)
        .getByPlaceholderText('Tournament name')
        .getAttribute('value')
    ).toBe('');
  });

  it.each([0, 1])(
    'opens the shared overview form from entry point %s and returns focus there',
    async (index) => {
      renderPage();
      await screen.findByText('No tournaments yet');
      const triggers = screen.getAllByRole('button', {
        name: 'New tournament',
      });
      const trigger = triggers[index];
      if (!trigger) throw new Error('Creation entry point is missing');
      trigger.focus();
      activate(trigger);
      const dialog = await screen.findByRole('dialog', {
        name: 'Create Tournament',
      });
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      fireEvent.change(within(dialog).getByPlaceholderText('Tournament name'), {
        target: { value: 'Draft name' },
      });
      fireEvent.keyDown(dialog, { key: 'Escape' });
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(trigger));
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      activate(trigger);
      const reopened = await screen.findByRole('dialog', {
        name: 'Create Tournament',
      });
      expect(
        within(reopened)
          .getByPlaceholderText('Tournament name')
          .getAttribute('value')
      ).toBe('');
    }
  );

  it('preserves the open form when the overview changes from grid to list', async () => {
    renderPage();
    await screen.findByText('No tournaments yet');
    const [trigger] = screen.getAllByRole('button', { name: 'New tournament' });
    if (!trigger) throw new Error('Toolbar trigger is missing');
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Create Tournament',
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Tournament name'), {
      target: { value: 'In-progress name' },
    });
    activate(screen.getByLabelText('List view'));
    await waitFor(() =>
      expect(screen.queryByText('No tournaments yet')).toBeNull()
    );
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(
      screen.getByPlaceholderText('Tournament name').getAttribute('value')
    ).toBe('In-progress name');
  });

  it('creates once with a trimmed name, refreshes queries, and opens the created tournament details despite filters', async () => {
    const { router, invalidate } = renderPage(
      '/dashboard/tournaments',
      '?view=grid&status=active&query=Existing'
    );
    await screen.findByText('No tournaments match');
    expect(
      screen.getByPlaceholderText('Search tournaments...').getAttribute('value')
    ).toBe('Existing');
    activate(screen.getByRole('button', { name: 'New tournament' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Create Tournament',
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Tournament name'), {
      target: { value: '  New tournament  ' },
    });
    submitForm(dialog);
    await screen.findByRole('heading', { name: 'Tournament details' });
    expect(mocks.create).toHaveBeenCalledExactlyOnceWith({
      name: 'New tournament',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: tournamentKeys.all });
    expect(mocks.successToast).toHaveBeenCalledWith(
      'Tournament created successfully'
    );
    expect(router.state.location.pathname).toBe(
      '/dashboard/tournaments/created-tournament'
    );
  });

  it('opens the created tournament details from the dashboard', async () => {
    const { router } = renderPage('/dashboard');
    const trigger = await screen.findByRole('button', {
      name: 'Create Tournament',
    });
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Create Tournament',
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Tournament name'), {
      target: { value: 'Dashboard tournament' },
    });
    submitForm(dialog);
    await screen.findByRole('heading', { name: 'Tournament details' });
    expect(router.state.location.pathname).toBe(
      '/dashboard/tournaments/created-tournament'
    );
    expect(mocks.create).toHaveBeenCalledExactlyOnceWith({
      name: 'Dashboard tournament',
    });
  });

  it('retains the name and stays open after failure so the user can retry', async () => {
    mocks.create.mockRejectedValueOnce(new Error('Creation failed'));
    const { router } = renderPage();
    await screen.findByText('No tournaments yet');
    const [trigger] = screen.getAllByRole('button', { name: 'New tournament' });
    if (!trigger) throw new Error('Toolbar trigger is missing');
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Create Tournament',
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Tournament name'), {
      target: { value: 'Retry this name' },
    });
    submitForm(dialog);
    await waitFor(() =>
      expect(mocks.errorToast).toHaveBeenCalledWith('Creation failed')
    );
    expect(
      screen.getByPlaceholderText('Tournament name').getAttribute('value')
    ).toBe('Retry this name');
    expect(router.state.location.pathname).toBe('/dashboard/tournaments');
    submitForm(dialog);
    await screen.findByRole('heading', { name: 'Tournament details' });
    expect(router.state.location.pathname).toBe(
      '/dashboard/tournaments/created-tournament'
    );
    expect(mocks.create).toHaveBeenCalledTimes(2);
  });

  it('blocks repeat submits and dismissal until creation finishes', async () => {
    let finishCreation = () => {};
    const completion = new Promise<typeof mocks.created>((resolve) => {
      finishCreation = () => resolve(mocks.created);
    });
    mocks.create.mockReturnValueOnce(completion);
    const { router } = renderPage();
    await screen.findByText('No tournaments yet');
    const [trigger] = screen.getAllByRole('button', { name: 'New tournament' });
    if (!trigger) throw new Error('Toolbar trigger is missing');
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Create Tournament',
    });
    const input = within(dialog).getByPlaceholderText('Tournament name');
    fireEvent.change(input, { target: { value: 'Pending tournament' } });
    submitForm(dialog);
    const pendingButton = await within(dialog).findByRole('button', {
      name: /Loading/,
    });
    expect(pendingButton.getAttribute('aria-busy')).toBe('true');
    expect(pendingButton.hasAttribute('disabled')).toBe(false);
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
    submitForm(dialog);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="dialog-overlay"]'
    );
    if (!overlay) throw new Error('Dialog overlay is missing');
    activate(overlay);
    expect(screen.getByRole('dialog', { name: 'Create Tournament' })).toBe(
      dialog
    );
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe('/dashboard/tournaments');
    await act(async () => {
      finishCreation();
      await completion;
    });
    await screen.findByRole('heading', { name: 'Tournament details' });
    expect(router.state.location.pathname).toBe(
      '/dashboard/tournaments/created-tournament'
    );
  });

  it('does not create a tournament with a whitespace-only name', async () => {
    renderPage();
    await screen.findByText('No tournaments yet');
    const [trigger] = screen.getAllByRole('button', { name: 'New tournament' });
    if (!trigger) throw new Error('Toolbar trigger is missing');
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Create Tournament',
    });
    fireEvent.change(within(dialog).getByPlaceholderText('Tournament name'), {
      target: { value: '   ' },
    });
    submitForm(dialog);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(
      within(dialog)
        .getByRole('button', { name: 'Create Tournament' })
        .hasAttribute('disabled')
    ).toBe(true);
  });
});
