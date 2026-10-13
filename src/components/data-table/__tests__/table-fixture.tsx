import { useTable } from '@tanstack/react-table';
import type { DataTableColumnDef } from '@/lib/data-table/features';
import { dataTableFeatures } from '@/lib/data-table/features';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface FixtureRow {
  id: string;
  name: string;
  team: Array<string>;
  weight: number;
}

const rows: Array<FixtureRow> = Array.from({ length: 24 }, (_, index) => ({
  id: `athlete-${index + 1}`,
  name: `Athlete ${String(index + 1).padStart(2, '0')}`,
  team: [index % 2 === 0 ? 'north' : 'south'],
  weight: 40 + index,
}));

const columns: Array<DataTableColumnDef<FixtureRow>> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label="Select current page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(!!checked)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column, table }) => (
      <DataTableColumnHeader
        column={column}
        state={table.store.state}
        label="Name"
      />
    ),
    filterFn: 'includesString',
    meta: { label: 'Name', variant: 'text', placeholder: 'Search athletes' },
  },
  {
    id: 'team',
    accessorKey: 'team',
    header: 'Team',
    cell: ({ row }) => row.original.team.join(', '),
    filterFn: 'arrIncludesSome',
    meta: {
      label: 'Team',
      variant: 'multiSelect',
      options: [
        { label: 'North', value: 'north' },
        { label: 'South', value: 'south' },
      ],
    },
  },
  {
    id: 'weight',
    accessorKey: 'weight',
    header: 'Weight',
    filterFn: 'inNumberRange',
    meta: { label: 'Weight', variant: 'range', range: [40, 80], unit: 'kg' },
  },
];

export function TableFixture({
  empty = false,
  fetching = false,
  onBulkAction,
}: {
  empty?: boolean;
  fetching?: boolean;
  onBulkAction?: (ids: Array<string>) => void;
}) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: empty ? emptyRows : rows,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });
  const state = {
    ...table.state,
    filteredRowCount: table.getFilteredRowModel().rows.length,
  };

  return (
    <DataTable
      table={table}
      state={state}
      isFetching={fetching}
      actionBar={
        <Button onClick={() => onBulkAction?.(Object.keys(state.rowSelection))}>
          Act on selected athletes
        </Button>
      }
    >
      <DataTableToolbar table={table} state={state} />
    </DataTable>
  );
}

const emptyRows: Array<FixtureRow> = [];
