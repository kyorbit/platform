import { createFileRoute } from '@tanstack/react-router';
import { NotFound } from '@/components/not-found';
import { DashboardRouteError } from '@/features/dashboard/components/dashboard-route-error';
import { parseTournamentsListInput } from '@/features/dashboard/lib/tournament/parse-tournaments-list-input';
import { tournamentsListQueryOptions } from '@/queries/tournament';
import { TournamentsOverview } from '@/features/dashboard/components/tournament/overview';
import { TournamentsPending } from '@/features/dashboard/components/tournament/overview/tournaments-pending';

export const Route = createFileRoute('/dashboard/tournaments/')({
  staticData: { breadcrumb: 'Tournaments' },
  loaderDeps: ({ search }) => ({
    input: parseTournamentsListInput(search as Record<string, unknown>),
  }),
  loader: async ({ context: { queryClient }, deps, cause }) => {
    const listOptions = tournamentsListQueryOptions(deps.input);
    if (cause === 'stay') {
      void queryClient.prefetchQuery(listOptions);
    } else {
      await queryClient.ensureQueryData(listOptions);
    }
  },
  pendingMs: 0,
  pendingMinMs: 0,
  pendingComponent: TournamentsPending,
  component: TournamentsOverview,
  errorComponent: DashboardRouteError,
  notFoundComponent: NotFound,
});
