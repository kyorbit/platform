// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { DataTableColumnDef } from '@/lib/data-table/features';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTableSliderFilter } from '@/components/data-table/data-table-slider-filter';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { formatDate } from '@/lib/format';

const data = [{ id: 'athlete-1', weight: 65 }];
const columns: Array<DataTableColumnDef<(typeof data)[number]>> = [
  {
    id: 'weight',
    accessorKey: 'weight',
    enableColumnFilter: true,
    meta: { label: 'Weight', variant: 'range', range: [0, 100], unit: 'kg' },
  },
];

function FilterFixture() {
  const { table } = useDataTable({ data, columns, pageCount: 1 });
  return (
    <>
      {table.getAllColumns().map((column) => (
        <DataTableSliderFilter key={column.id} column={column} title="Weight" />
      ))}
    </>
  );
}

const toolbarColumns: typeof columns = [
  ...columns,
  {
    id: 'id',
    accessorKey: 'id',
    enableColumnFilter: true,
    meta: { label: 'Athlete', variant: 'text', placeholder: 'Search athletes' },
  },
  {
    id: 'gender',
    accessorFn: () => 'male',
    enableColumnFilter: true,
    meta: {
      label: 'Gender',
      variant: 'multiSelect',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ],
    },
  },
  {
    id: 'createdAt',
    accessorFn: () => 0,
    enableColumnFilter: true,
    meta: { label: 'Created', variant: 'dateRange' },
  },
];

function ToolbarFixture() {
  const { table, state } = useDataTable({
    data,
    columns: toolbarColumns,
    pageCount: 1,
    debounceMs: 1,
    throttleMs: 1,
    filterQueryKeys: { id: 'q', createdAt: 'created' },
  });
  return <DataTableToolbar table={table} state={state} />;
}

function weightButton() {
  return screen.getByText('Weight').closest('button');
}

afterEach(cleanup);

describe('filter controls restored from the URL', () => {
  it('shows the saved weight range when mounting a bookmarked or refreshed URL', async () => {
    render(
      <NuqsTestingAdapter searchParams="?weight=56,74" hasMemory>
        <FilterFixture />
      </NuqsTestingAdapter>
    );
    await waitFor(() =>
      expect(screen.getByText('Weight').closest('button')?.textContent).toMatch(
        /56.*74.*kg/
      )
    );
  });

  it('restores range, text, and facet controls together and clears their URL values on reset', async () => {
    const onUrlUpdate = vi.fn();
    render(
      <NuqsTestingAdapter
        searchParams="?weight=56,74&q=athlete&gender=male"
        hasMemory
        onUrlUpdate={onUrlUpdate}
      >
        <ToolbarFixture />
      </NuqsTestingAdapter>
    );
    expect(weightButton()?.textContent).toMatch(/56.*74.*kg/);
    expect(screen.getByDisplayValue('athlete')).toBeDefined();
    expect(screen.getByText('Male')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    await waitFor(() => {
      const params = onUrlUpdate.mock.lastCall?.[0].searchParams;
      expect(params).toBeDefined();
      expect(params.get('weight')).toBeNull();
      expect(params.get('q')).toBeNull();
      expect(params.get('gender')).toBeNull();
    });
    expect(weightButton()?.textContent).toBe('Weight');
    expect(screen.queryByDisplayValue('athlete')).toBeNull();
    expect(screen.queryByText('Male')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reset filters' })).toBeNull();
  });

  it('keeps edited decimal range values after serializing and remounting the saved URL', async () => {
    const onUrlUpdate = vi.fn();
    const first = render(
      <NuqsTestingAdapter
        searchParams="?weight=56,74"
        hasMemory
        onUrlUpdate={onUrlUpdate}
      >
        <ToolbarFixture />
      </NuqsTestingAdapter>
    );
    await act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Weight.*56.*74/ }));
    });
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '60.5' },
    });
    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('weight')).toBe(
        '60.5,74'
      )
    );
    const savedSearch = onUrlUpdate.mock.lastCall?.[0].searchParams.toString();
    first.unmount();
    render(
      <NuqsTestingAdapter searchParams={savedSearch} hasMemory>
        <ToolbarFixture />
      </NuqsTestingAdapter>
    );
    expect(
      screen.getByRole('button', { name: /Weight.*61.*74/ })
    ).toBeDefined();
    await act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Weight.*61.*74/ }));
    });
    expect(screen.getByLabelText('From').getAttribute('value')).toBe('60.5');
    expect(screen.getByLabelText('to').getAttribute('value')).toBe('74');
  });

  it('restores both dates of a saved date range through its query key alias', () => {
    const from = new Date(2026, 9, 1).getTime();
    const to = new Date(2026, 9, 13).getTime();
    render(
      <NuqsTestingAdapter searchParams={`?created=${from},${to}`} hasMemory>
        <ToolbarFixture />
      </NuqsTestingAdapter>
    );
    expect(
      screen.getByText(`${formatDate(from)} - ${formatDate(to)}`)
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Clear Created filter' })
    ).toBeDefined();
  });
});
