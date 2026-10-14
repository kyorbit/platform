import { TournamentCardSkeleton } from '@/features/dashboard/components/tournament/overview/tournaments-grid/tournament-card-skeleton';

const GRID_SKELETON_COUNT = 8;

/** Route pending UI — outlet swaps immediately instead of holding the previous page. */
export function TournamentsPending() {
  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-7xl flex-1 overflow-auto p-6">
        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: GRID_SKELETON_COUNT }, (_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
