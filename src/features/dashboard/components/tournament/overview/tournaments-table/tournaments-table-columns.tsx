import { formatDistanceToNow } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { TournamentStatusPill } from '../../tournament-status-pill';
import { TournamentsActionMenu } from './tournaments-action-menu';
import type { TournamentListItem } from '@/contracts/tournaments/dto';

import type { TournamentRowActionOptions } from '@/features/dashboard/lib/tournament/row-action-options';
import type { DataTableColumnDef } from '@/lib/data-table/features';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

function resolveRowData(
  row: { original: TournamentListItem },
  options: TournamentRowActionOptions
): TournamentListItem {
  return options.resolveTournament?.(row.original.id) ?? row.original;
}

export function getTournamentsTableColumns(
  options: TournamentRowActionOptions
): Array<DataTableColumnDef<TournamentListItem>> {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column, table }) => (
        <DataTableColumnHeader
          column={column}
          state={table.store.state}
          label="Tournament"
        />
      ),
      cell: ({ row }) => (
        <Link
          to="/dashboard/tournaments/$id"
          params={{ id: row.original.id }}
          aria-label={`Open ${row.original.name}`}
          className="group/link flex min-w-0 flex-col"
        >
          <span className="truncate font-medium underline-offset-2 group-hover/link:underline">
            {row.original.name}
          </span>
          <span className="text-muted-foreground truncate font-mono text-xs">
            {row.original.id.slice(-12)}
          </span>
        </Link>
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        label: 'Tournament',
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column, table }) => (
        <DataTableColumnHeader
          column={column}
          state={table.store.state}
          label="Status"
        />
      ),
      cell: ({ row }) => (
        <TournamentStatusPill status={resolveRowData(row, options).status} />
      ),
      maxSize: 140,
      enableHiding: false,
      enableSorting: false,
      meta: {
        label: 'Status',
      },
    },
    {
      id: 'divisions',
      accessorFn: (row) => row._count.divisions,
      header: ({ column, table }) => (
        <DataTableColumnHeader
          column={column}
          state={table.store.state}
          label="Divisions"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original._count.divisions}</span>
      ),
      maxSize: 100,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'athletes',
      accessorFn: (row) => row._count.tournamentAthletes,
      header: ({ column, table }) => (
        <DataTableColumnHeader
          column={column}
          state={table.store.state}
          label="Athletes"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original._count.tournamentAthletes}
        </span>
      ),
      maxSize: 100,
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'matches',
      accessorFn: (row) => row._count.matches,
      header: ({ column, table }) => (
        <DataTableColumnHeader
          column={column}
          state={table.store.state}
          label="Matches"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original._count.matches}</span>
      ),
      maxSize: 100,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column, table }) => (
        <DataTableColumnHeader
          column={column}
          state={table.store.state}
          label="Created"
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
          })}
        </span>
      ),
      maxSize: 160,
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <TournamentsActionMenu
          options={options}
          row={row}
          tournament={resolveRowData(row, options)}
        />
      ),
      maxSize: 32,
      minSize: 32,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
