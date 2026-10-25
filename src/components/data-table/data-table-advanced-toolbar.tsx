import type { RowData } from '@tanstack/react-table';
import type * as React from 'react';

import type { DataTableControlledState } from '@/hooks/use-data-table';
import type { DataTableInstance } from '@/lib/data-table/features';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { cn } from '@/lib/utils';

interface DataTableAdvancedToolbarProps<
  TData extends RowData,
> extends React.ComponentProps<'div'> {
  table: DataTableInstance<TData>;
  state: DataTableControlledState;
}

export function DataTableAdvancedToolbar<TData extends RowData>({
  table,
  state,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        'flex w-full flex-wrap items-start justify-between gap-2 p-1',
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} state={state} align="end" />
      </div>
    </div>
  );
}
