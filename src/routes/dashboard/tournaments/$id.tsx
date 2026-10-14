import { Link, createFileRoute } from '@tanstack/react-router';
import { NotFound } from '@/components/not-found';
import { TournamentRouteError } from '@/features/dashboard/components/dashboard-route-error';
import { TournamentCommandCenter } from '@/features/dashboard/components/tournament/command-center';
import { useTournamentRealtimeStream } from '@/hooks/use-tournament-realtime-stream';
import { divisionListQueryOptions } from '@/queries/division/division-list-query-options';
import { activityListInfiniteQueryOptions } from '@/queries/activity';
import { tournamentMatchesQueryOptions } from '@/queries/match';
import { tournamentQueryOptions } from '@/queries/tournament';

export const Route = createFileRoute('/dashboard/tournaments/$id')({
  staticData: {
    breadcrumb: (
      <Link
        to="/dashboard/tournaments"
        className="text-muted-foreground hover:text-foreground"
      >
        Tournaments
      </Link>
    ),
  },
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData(tournamentQueryOptions(params.id));
    void queryClient.prefetchQuery(divisionListQueryOptions(params.id));
    void queryClient.prefetchQuery(tournamentMatchesQueryOptions(params.id));
    void queryClient.prefetchInfiniteQuery({
      ...activityListInfiniteQueryOptions({
        tournamentId: params.id,
        limit: 8,
      }),
    });
  },
  component: TournamentPage,
  errorComponent: TournamentRouteError,
  notFoundComponent: NotFound,
});

function TournamentPage() {
  const { id } = Route.useParams();
  useTournamentRealtimeStream(id);

  return <TournamentCommandCenter tournamentId={id} />;
}
