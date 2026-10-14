import { createFileRoute } from '@tanstack/react-router';
import { AthletesPage } from '@/features/dashboard/components/athlete/athletes-page';
import { AthletesPending } from '@/features/dashboard/components/athlete/athletes-pending';
import { DashboardRouteError } from '@/features/dashboard/components/dashboard-route-error';
import { parseAthletesListInput } from '@/features/dashboard/lib/athlete/parse-athletes-list-input';
import { athleteProfilesQueryOptions } from '@/queries/athlete-profile';
import { tournamentsAllQueryOptions } from '@/queries/tournament';
import { NotFound } from '@/components/not-found';

export const Route = createFileRoute('/dashboard/athletes/')({
  staticData: { breadcrumb: 'Athletes' },
  loaderDeps: ({ search }) => ({
    input: parseAthletesListInput(search as Record<string, unknown>),
  }),
  loader: async ({ context: { queryClient }, deps, cause }) => {
    const listOptions = athleteProfilesQueryOptions(deps.input);
    // Enter/preload: await so pendingComponent replaces the previous outlet.
    // Stay (filter/page/sort): prefetch only — keepPreviousData dims rows in-place.
    if (cause === 'stay') {
      void queryClient.prefetchQuery(listOptions);
    } else {
      await queryClient.ensureQueryData(listOptions);
    }
    void queryClient.prefetchQuery(tournamentsAllQueryOptions());
  },
  pendingMs: 0,
  pendingMinMs: 0,
  pendingComponent: AthletesPending,
  component: AthletesPage,
  errorComponent: DashboardRouteError,
  notFoundComponent: NotFound,
});
