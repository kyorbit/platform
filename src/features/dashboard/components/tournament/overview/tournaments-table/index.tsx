import type {
  TournamentListItem,
  TournamentSortField,
  TournamentStatus,
} from '@/contracts/tournaments/dto';
import type { TournamentsManagerQuery } from '@/features/dashboard/hooks/use-tournaments-manager-query';

import type { DataTableColumnDef } from '@/lib/data-table/features';
import { useTournamentList } from '@/queries/tournament';
import { useDataTable } from '@/hooks/use-data-table';
import { cn } from '@/lib/utils';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';

const TOURNAMENT_TABLE_COLUMN_COUNT = 7;

interface TournamentsTableProps {
  columns: Array<DataTableColumnDef<TournamentListItem>>;
  query: TournamentsManagerQuery;
  className?: string;
}

export function TournamentsTable({
  columns,
  query,
  className,
}: TournamentsTableProps) {
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

  // Hooks must run every render — do not early-return before useDataTable.
  const { table, state: tableState } = useDataTable({
    data: data?.items ?? [],
    columns,
    pageCount: Math.max(1, Math.ceil((data?.total ?? 0) / query.perPage)),
    filteredRowCount: data?.total ?? 0,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      columnPinning: { start: ['name'], end: ['actions'] },
    },
    shallow: true,
    clearOnDefault: true,
  });

  if (isPending && !data) {
    return (
      <DataTableSkeleton
        className={className}
        columnCount={TOURNAMENT_TABLE_COLUMN_COUNT}
        withViewOptions={false}
        filterCount={0}
      />
    );
  }

  return (
    <div className={cn('flex-1 overflow-auto', className)}>
      <DataTable
        table={table}
        state={tableState}
        selectedRows={false}
        isFetching={isPlaceholderData}
      />
    </div>
  );
}
