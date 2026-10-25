// @vitest-environment jsdom

import { useState } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
  DashboardHeaderContent,
  DashboardHeaderProvider,
  HeaderActions,
} from '@/features/dashboard/components/sidebar/dashboard-header';
import { SiteHeader } from '@/features/dashboard/components/sidebar/site-header';

beforeAll(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal('scrollTo', () => {});
});

afterEach(cleanup);

function Layout() {
  return (
    <SidebarProvider>
      <DashboardHeaderProvider>
        <SiteHeader />
        <Outlet />
      </DashboardHeaderProvider>
    </SidebarProvider>
  );
}

function AthletePage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DashboardHeaderContent>
        <button onClick={() => setOpen(true)}>Add Athlete</button>
      </DashboardHeaderContent>
      <main>Athlete list</main>
      {open && <div role="dialog">Create athlete</div>}
    </>
  );
}

function TournamentPage() {
  const [name, setName] = useState('Spring Open');
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <>
      <DashboardHeaderContent breadcrumb={name}>
        <HeaderActions
          actions={[
            {
              label: 'Activity',
              icon: null,
              onClick: () => setOpened('activity'),
            },
            {
              label: 'Open Builder',
              icon: null,
              onClick: () => setOpened('builder'),
            },
          ]}
        />
        <button onClick={() => setName('Summer Open')}>
          Rename tournament
        </button>
      </DashboardHeaderContent>
      <main>Tournament details</main>
      {opened && <div role="status">{opened}</div>}
    </>
  );
}

async function renderDashboard(loader: () => Promise<void> = async () => {}) {
  const root = createRootRoute({ component: Layout });
  const home = createRoute({
    getParentRoute: () => root,
    path: '/dashboard',
    staticData: { breadcrumb: 'Dashboard' },
    component: () => <main>Dashboard home</main>,
  });
  const athletes = createRoute({
    getParentRoute: () => root,
    path: '/dashboard/athletes',
    staticData: { breadcrumb: 'Athletes' },
    loader,
    pendingMs: 0,
    pendingMinMs: 0,
    pendingComponent: () => <main>Loading athletes</main>,
    errorComponent: () => <main>Unable to load athletes</main>,
    component: AthletePage,
  });
  const tournament = createRoute({
    getParentRoute: () => root,
    path: '/dashboard/tournaments/$id',
    staticData: { breadcrumb: 'Tournaments' },
    component: TournamentPage,
  });
  const router = createRouter({
    routeTree: root.addChildren([home, athletes, tournament]),
    history: createMemoryHistory({ initialEntries: ['/dashboard'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  await screen.findByText('Dashboard home');
  return router;
}

describe('shared dashboard header', () => {
  it('keeps one header mounted across navigation and preserves page action handlers', async () => {
    const router = await renderDashboard();
    const header = screen.getByRole('banner');
    await act(() => router.navigate({ to: '/dashboard/athletes' }));

    expect(screen.getByRole('banner')).toBe(header);
    expect(within(header).getByText('Athletes')).toBeTruthy();
    fireEvent.click(
      within(header).getByRole('button', { name: 'Add Athlete' })
    );
    expect(screen.getByRole('dialog').textContent).toBe('Create athlete');

    await act(() => router.navigate({ to: '/dashboard' }));
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getByRole('banner')).toBe(header);
    expect(within(header).queryByText('Add Athlete')).toBeNull();
    expect(within(header).getByText('Dashboard')).toBeTruthy();
  });

  it('updates dynamic breadcrumbs and removes them when leaving the page', async () => {
    const router = await renderDashboard();
    await act(() =>
      router.navigate({
        to: '/dashboard/tournaments/$id',
        params: { id: 'one' },
      })
    );
    const breadcrumb = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(within(breadcrumb).getByText('Tournaments')).toBeTruthy();
    expect(within(breadcrumb).getByText('Spring Open')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Rename tournament' }));
    expect(within(breadcrumb).getByText('Summer Open')).toBeTruthy();
    expect(within(breadcrumb).queryByText('Spring Open')).toBeNull();

    await act(() => router.navigate({ to: '/dashboard' }));
    expect(within(breadcrumb).queryByText('Summer Open')).toBeNull();
    expect(screen.queryByText('Rename tournament')).toBeNull();
  });

  it('keeps the primary action visible and offers secondary actions in the "⋯" menu', async () => {
    const router = await renderDashboard();
    await act(() =>
      router.navigate({
        to: '/dashboard/tournaments/$id',
        params: { id: 'one' },
      })
    );
    const header = screen.getByRole('banner');
    expect(
      within(header).getByRole('button', { name: 'Rename tournament' })
    ).toBeTruthy();

    fireEvent.click(
      within(header).getByRole('button', { name: 'More actions' })
    );
    const menu = await screen.findByRole('menu');
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent)
    ).toEqual(['Activity', 'Open Builder']);
    expect(within(menu).queryByText('Rename tournament')).toBeNull();

    fireEvent.click(
      within(menu).getByRole('menuitem', { name: 'Open Builder' })
    );
    expect(screen.getByRole('status').textContent).toBe('builder');
  });

  it('shows the destination breadcrumb during pending and error states without stale actions', async () => {
    let rejectLoad: (error: Error) => void = () => {};
    const pending = new Promise<void>((_, reject) => {
      rejectLoad = reject;
    });
    const router = await renderDashboard(() => pending);
    await act(() =>
      router.navigate({
        to: '/dashboard/tournaments/$id',
        params: { id: 'one' },
      })
    );
    const header = screen.getByRole('banner');
    let navigation: Promise<void>;
    await act(() => {
      navigation = router.navigate({ to: '/dashboard/athletes' });
    });
    await screen.findByText('Loading athletes');
    expect(within(header).getByText('Athletes')).toBeTruthy();
    expect(within(header).queryByText('Spring Open')).toBeNull();
    expect(within(header).queryByText('Rename tournament')).toBeNull();

    await act(async () => {
      rejectLoad(new Error('Athletes unavailable'));
      await navigation;
    });
    await screen.findByText('Unable to load athletes');
    expect(screen.getByRole('banner')).toBe(header);
    expect(within(header).getByText('Athletes')).toBeTruthy();
  });
});
