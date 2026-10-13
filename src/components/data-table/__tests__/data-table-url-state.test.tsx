// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { DataTableColumnDef } from '@/lib/data-table/features';
import { useDataTable } from '@/hooks/use-data-table';

const data = [{ id: 'athlete-1', name: 'Alpha', team: ['north'] }];
const columns: Array<DataTableColumnDef<(typeof data)[number]>> = [
  { id: 'name', accessorKey: 'name', enableColumnFilter: true },
  {
    id: 'team',
    accessorKey: 'team',
    enableColumnFilter: true,
    meta: { options: [{ label: 'North', value: 'north' }] },
  },
];

afterEach(cleanup);

function setup() {
  const onUrlUpdate = vi.fn();
  const hook = renderHook(
    () =>
      useDataTable({
        data,
        columns,
        pageCount: 3,
        debounceMs: 1,
        throttleMs: 1,
      }),
    {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter hasMemory onUrlUpdate={onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      ),
    }
  );
  return { ...hook, onUrlUpdate };
}

describe('data-table query state', () => {
  it('persists pagination and sort choices in URL state', async () => {
    const { result, onUrlUpdate } = setup();
    act(() => result.current.table.setPageIndex(1));
    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('page')).toBe('2')
    );
    expect(result.current.state.pagination.pageIndex).toBe(1);
    act(() => result.current.table.setPageSize(20));
    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('perPage')).toBe(
        '20'
      )
    );
    expect(result.current.state.pagination.pageSize).toBe(20);
    act(() => result.current.table.setSorting([{ id: 'name', desc: true }]));
    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('sort')).toContain(
        'name'
      )
    );
    expect(result.current.state.sorting).toEqual([{ id: 'name', desc: true }]);
  });

  it('keeps clearing one filter while another filter updates in the same flush', async () => {
    const { result, onUrlUpdate } = setup();
    act(() => {
      result.current.table.getColumn('name')?.setFilterValue('Alpha');
      result.current.table.getColumn('team')?.setFilterValue(['north']);
    });
    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('name')).toBe(
        'Alpha'
      )
    );
    act(() => {
      result.current.table.getColumn('name')?.setFilterValue(undefined);
      result.current.table.getColumn('team')?.setFilterValue(['south']);
    });
    await waitFor(() => {
      const params = onUrlUpdate.mock.lastCall?.[0].searchParams;
      expect(params?.get('name')).toBeNull();
      expect(params?.get('team')).toBe('south');
    });
    expect(result.current.state.columnFilters).toEqual([
      { id: 'team', value: ['south'] },
    ]);
  });
});
