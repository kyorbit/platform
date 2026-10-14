import React from 'react';
import { useQueryStates } from 'nuqs';

import { CreateTournamentDialog } from '../create-tournament-dialog';
import { useTournamentsViewMode } from './tournaments-toolbar/view-mode-toggle';
import { TournamentsToolbar } from './tournaments-toolbar';
import { TournamentsGrid } from './tournaments-grid';
import { TournamentsTable } from './tournaments-table';
import { getTournamentsTableColumns } from './tournaments-table/tournaments-table-columns';
import { RenameTournamentDialog } from './dialogs/rename-tournament-dialog';
import { DeleteTournamentDialog } from './dialogs/delete-tournament-dialog';
import type { TournamentListItem } from '@/contracts/tournament/list';
import type { DataTableRowAction } from '@/lib/data-table/features';
import { useTournamentsManagerQuery } from '@/features/dashboard/hooks/use-tournaments-manager-query';
import { ErrorBoundary } from '@/components/error-boundary';

export function TournamentsOverview() {
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<TournamentListItem> | null>(null);
  const [viewMode] = useTournamentsViewMode();
  const query = useTournamentsManagerQuery();

  const [, setUrlFilters] = useQueryStates({
    query: { parse: (value) => value, serialize: (v) => v ?? '' },
    status: { parse: (value) => value, serialize: (v) => v ?? '' },
  });

  const columns = React.useMemo(
    () => getTournamentsTableColumns({ onRowAction: setRowAction }),
    []
  );

  const onClearFilters = React.useCallback(() => {
    void setUrlFilters({ query: null, status: null });
  }, [setUrlFilters]);

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-7xl flex-1 overflow-auto p-6">
        <CreateTournamentDialog>
          <TournamentsToolbar />
          <ErrorBoundary title="Failed to load tournaments">
            {viewMode === 'grid' ? (
              <TournamentsGrid
                query={query}
                onRowAction={setRowAction}
                onClearFilters={onClearFilters}
                className="pt-2"
              />
            ) : (
              <TournamentsTable
                columns={columns}
                query={query}
                className="pt-2"
              />
            )}
          </ErrorBoundary>
        </CreateTournamentDialog>
      </div>

      <RenameTournamentDialog
        tournament={
          rowAction?.variant === 'update' ? rowAction.row.original : null
        }
        onOpenChange={() => setRowAction(null)}
      />
      <DeleteTournamentDialog
        tournament={
          rowAction?.variant === 'delete' ? rowAction.row.original : null
        }
        onClose={() => setRowAction(null)}
      />
    </div>
  );
}
