import { createFileRoute } from '@tanstack/react-router';
import { NotFound } from '@/components/not-found';
import { TournamentRouteError } from '@/features/dashboard/components/dashboard-route-error';
import { TournamentBuilder } from '@/features/dashboard/components/tournament/builder';
import LoadingScreen from '@/components/navigation/loading';
import { divisionListQueryOptions } from '@/queries/division/division-list-query-options';
import { tournamentMatchesQueryOptions } from '@/queries/match';
import { tournamentQueryOptions } from '@/queries/tournament';
import { requireSession } from '@/queries/session';
import { ThemeProvider } from '@/contexts/themes';
import { Toaster } from '@/components/ui/sonner';

export const Route = createFileRoute('/dashboard_/tournaments/$id/builder')({
  beforeLoad: ({ context: { queryClient } }) => requireSession(queryClient),
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData(tournamentQueryOptions(params.id));
    void queryClient.prefetchQuery(divisionListQueryOptions(params.id));
    void queryClient.prefetchQuery(tournamentMatchesQueryOptions(params.id));
  },
  pendingComponent: () => <LoadingScreen title="Loading workspace..." />,
  component: TournamentBuilderPage,
  errorComponent: TournamentRouteError,
  notFoundComponent: NotFound,
});

function TournamentBuilderPage() {
  const { id } = Route.useParams();

  return (
    <ThemeProvider defaultTheme="system" storageKey="start-theme">
      <TournamentBuilder id={id} />
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}
