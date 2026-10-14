import { createFileRoute } from '@tanstack/react-router';
import { DashboardRouteError } from '@/features/dashboard/components/dashboard-route-error';
import { DashboardHome } from '@/features/dashboard/components/home/dashboard-home';
import { tournamentsAllQueryOptions } from '@/queries/tournament';
import { NotFound } from '@/components/not-found';

export const Route = createFileRoute('/dashboard/')({
  staticData: { breadcrumb: 'Dashboard' },
  loader: ({ context: { queryClient } }) => {
    // Defer list data — shell paints immediately; Suspense streams content.
    void queryClient.prefetchQuery(tournamentsAllQueryOptions());
  },
  pendingMs: 0,
  pendingMinMs: 0,
  component: DashboardHome,
  errorComponent: DashboardRouteError,
  notFoundComponent: NotFound,
});
