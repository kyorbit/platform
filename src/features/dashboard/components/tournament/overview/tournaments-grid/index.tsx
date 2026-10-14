import { TournamentsEmptyState } from '../tournaments-empty-state';
import { TournamentCardSkeleton } from './tournament-card-skeleton';
import { TournamentCard } from './tournament-card';
import type { TournamentsManagerQuery } from '@/features/dashboard/hooks/use-tournaments-manager-query';
import type { TournamentRowActionOptions } from '@/features/dashboard/lib/tournament/row-action-options';
import type {
  TournamentSortField,
  TournamentStatus,
} from '@/contracts/tournament/list';
import { useTournamentList } from '@/queries/tournament';
import { cn } from '@/lib/utils';

const GRID_SKELETON_COUNT = 8;

interface TournamentsGridProps {
  query: TournamentsManagerQuery;
  onRowAction: TournamentRowActionOptions['onRowAction'];
  onClearFilters: () => void;
  className?: string;
}

export function TournamentsGrid({
  query,
  onRowAction,
  onClearFilters,
  className,
}: TournamentsGridProps) {
  const { data, isPending, isPlaceholderData } = useTournamentList({
    page: query.page,
    perPage: query.perPage,
    query: query.queryFilter ?? undefined,
    name: query.nameFilter ?? undefined,
    status:
      query.statusFilter && query.statusFilter.length > 0
        ? (query.statusFilter as Array<TournamentStatus>)
        : undefined,
    sort: query.sort?.[0]?.id as TournamentSortField,
    sortDir: query.sort?.[0]?.desc ? 'desc' : 'asc',
  });

  if (isPending && !data) {
    return (
      <div
        className={cn(
          'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          className
        )}
      >
        {Array.from({ length: GRID_SKELETON_COUNT }, (_, i) => (
          <TournamentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const tournaments = data?.items ?? [];

  if ((data?.total ?? 0) === 0) {
    const hasActiveFilters =
      (query.queryFilter ?? '').trim().length > 0 ||
      (query.statusFilter?.length ?? 0) > 0;

    return (
      <TournamentsEmptyState
        variant={hasActiveFilters ? 'no-results' : 'no-data'}
        onClearFilters={hasActiveFilters ? onClearFilters : undefined}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        isPlaceholderData &&
          'pointer-events-none opacity-50 transition-opacity',
        className
      )}
      aria-busy={isPlaceholderData || undefined}
    >
      {tournaments.map((tournament) => (
        <TournamentCard
          key={tournament.id}
          tournament={tournament}
          onRowAction={onRowAction}
        />
      ))}
    </div>
  );
}
