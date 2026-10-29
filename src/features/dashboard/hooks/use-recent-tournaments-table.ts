import React from 'react';
import { useTable } from '@tanstack/react-table';
import type { TournamentListItem } from '@/contracts/tournaments/dto';
import type {
  ColumnVisibilityState,
  SortingState,
} from '@tanstack/react-table';
import type { DataTableControlledState } from '@/hooks/use-data-table';
import type { TournamentRowActionOptions } from '@/features/dashboard/lib/tournament/row-action-options';
import { getTournamentsTableColumns } from '@/features/dashboard/components/tournament/overview/tournaments-table/tournaments-table-columns';
import { dataTableFeatures } from '@/lib/data-table/features';

export function useRecentTournamentsTable(
  tournaments: Array<TournamentListItem>,
  onRowAction: TournamentRowActionOptions['onRowAction']
) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [columnVisibility] = React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const tournamentById = React.useMemo(
    () => new Map(tournaments.map((t) => [t.id, t])),
    [tournaments]
  );

  const resolveTournament = React.useCallback(
    (id: string) => tournamentById.get(id),
    [tournamentById]
  );

  const columns = React.useMemo(
    () => getTournamentsTableColumns({ onRowAction, resolveTournament }),
    [onRowAction, resolveTournament]
  );

  const pageSize = Math.max(tournaments.length, 1);

  const tableState = React.useMemo<DataTableControlledState>(
    () => ({
      pagination: { pageIndex: 0, pageSize },
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: [],
      filteredRowCount: tournaments.length,
    }),
    [pageSize, sorting, columnVisibility, rowSelection, tournaments.length]
  );

  const table = useTable({
    features: dataTableFeatures,
    data: tournaments,
    columns,
    state: {
      ...tableState,
      columnPinning: { start: [], end: ['actions'] },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    enableRowSelection: false,
  });

  return { table, tableState };
}
