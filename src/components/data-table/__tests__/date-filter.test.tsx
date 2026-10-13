// @vitest-environment jsdom

import { useTable } from '@tanstack/react-table';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { DataTableColumnDef } from '@/lib/data-table/features';
import { dataTableFeatures } from '@/lib/data-table/features';
import { DataTableDateFilter } from '@/components/data-table/data-table-date-filter';

const today = new Date();
const first = new Date(today.getFullYear(), today.getMonth(), 10);
const second = new Date(today.getFullYear(), today.getMonth(), 11);
const third = new Date(today.getFullYear(), today.getMonth(), 12);
const rows = [
  { id: 'first', name: 'First athlete', joined: first.getTime() },
  { id: 'second', name: 'Second athlete', joined: second.getTime() },
  { id: 'third', name: 'Third athlete', joined: third.getTime() },
];
const columns: Array<DataTableColumnDef<(typeof rows)[number]>> = [
  {
    id: 'joined',
    accessorKey: 'joined',
    enableColumnFilter: true,
    filterFn: (row, _columnId, selection: unknown) => {
      if (typeof selection === 'number')
        return row.original.joined === selection;
      if (!Array.isArray(selection)) return true;
      const [from, to] = selection;
      return (
        (typeof from !== 'number' || row.original.joined >= from) &&
        (typeof to !== 'number' || row.original.joined <= to)
      );
    },
  },
];

function DateFixture({ multiple = false }: { multiple?: boolean }) {
  const table = useTable({ features: dataTableFeatures, columns, data: rows });
  const column = table.getColumn('joined');
  if (!column) throw new Error('Date fixture column is missing');
  return (
    <>
      <DataTableDateFilter column={column} title="Joined" multiple={multiple} />
      <ul aria-label="Filtered athletes">
        {table.getFilteredRowModel().rows.map((row) => (
          <li key={row.id}>{row.original.name}</li>
        ))}
      </ul>
    </>
  );
}

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  HTMLElement.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

function selectDate(date: Date) {
  const day = document.querySelector(
    `[data-day="${date.toLocaleDateString()}"]`
  );
  if (!day) throw new Error('Calendar day is not visible');
  fireEvent.click(day);
}

describe('date filter calendar composition', () => {
  it('filters actual rows by a selected date and clears without reopening the popup', async () => {
    render(<DateFixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Joined' }));
    await screen.findByRole('grid');
    selectDate(second);
    await waitFor(() =>
      expect(screen.getAllByRole('listitem').map((e) => e.textContent)).toEqual(
        ['Second athlete']
      )
    );
    fireEvent.keyDown(document.activeElement ?? document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('grid')).toBeNull());
    fireEvent.click(
      screen.getByRole('button', { name: 'Clear Joined filter' })
    );
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')).toHaveLength(3)
    );
    expect(screen.queryByRole('grid')).toBeNull();
  });

  it('filters an inclusive date range and keeps the calendar interactive', async () => {
    render(<DateFixture multiple />);
    fireEvent.click(screen.getByRole('button', { name: 'Joined' }));
    await screen.findAllByRole('grid');
    selectDate(first);
    selectDate(second);
    await waitFor(() =>
      expect(screen.getAllByRole('listitem').map((e) => e.textContent)).toEqual(
        ['First athlete', 'Second athlete']
      )
    );
    expect(screen.getByRole('grid')).toBeTruthy();
  });
});
