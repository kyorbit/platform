// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { TableFixture } from './table-fixture';

beforeAll(() => {
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      readonly pointerType: string;
      constructor(type: string, options: PointerEventInit = {}) {
        super(type, options);
        this.pointerType = options.pointerType ?? 'mouse';
      }
    }
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
  HTMLElement.prototype.scrollIntoView = () => {};
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
});

afterEach(cleanup);

function visibleNames() {
  const body = screen.getByRole('table').querySelector('tbody');
  if (!body) throw new Error('Table body was not rendered');
  return within(body)
    .getAllByRole('row')
    .map((row) => row.textContent);
}

function activate(element: HTMLElement) {
  fireEvent.pointerDown(element, {
    button: 0,
    ctrlKey: false,
    pointerType: 'mouse',
  });
  fireEvent.mouseDown(element, { button: 0 });
  fireEvent.pointerUp(element, { button: 0, pointerType: 'mouse' });
  fireEvent.mouseUp(element, { button: 0 });
  fireEvent.click(element);
}

describe('shared data-table interactions', () => {
  it('selects stable athlete IDs, shows mixed page selection, and preserves selection across pages', async () => {
    const onBulkAction = vi.fn();
    render(<TableFixture onBulkAction={onBulkAction} />);
    const header = screen.getByRole('checkbox', {
      name: 'Select current page',
    });
    expect(header.getAttribute('aria-checked')).toBe('false');
    activate(screen.getByRole('checkbox', { name: 'Select Athlete 01' }));
    await waitFor(() =>
      expect(header.getAttribute('aria-checked')).toBe('mixed')
    );
    expect(screen.getByText('1 of 24 rows selected.')).toBeTruthy();
    activate(screen.getByRole('button', { name: 'Act on selected athletes' }));
    expect(onBulkAction).toHaveBeenCalledWith(['athlete-1']);
    activate(header);
    await waitFor(() =>
      expect(screen.getByText('10 of 24 rows selected.')).toBeTruthy()
    );
    expect(header.getAttribute('aria-checked')).toBe('true');
    activate(screen.getByRole('button', { name: 'Go to next page' }));
    await screen.findByText('Athlete 11');
    expect(header.getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText('10 of 24 rows selected.')).toBeTruthy();
    activate(screen.getByRole('button', { name: 'Go to previous page' }));
    await screen.findByText('Athlete 01');
    expect(header.getAttribute('aria-checked')).toBe('true');
    activate(header);
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Act on selected athletes' })
      ).toBeNull()
    );
  });

  it('filters visible rows and restores the table when filters are reset', async () => {
    render(<TableFixture />);
    fireEvent.change(screen.getByPlaceholderText('Search athletes'), {
      target: { value: 'Athlete 24' },
    });
    await waitFor(() => expect(visibleNames()).toHaveLength(1));
    expect(screen.getByText('Athlete 24')).toBeTruthy();
    expect(screen.queryByText('Athlete 01')).toBeNull();
    activate(screen.getByRole('button', { name: 'Reset filters' }));
    await screen.findByText('Athlete 01');
    expect(visibleNames()).toHaveLength(10);
    expect(
      screen.getByPlaceholderText('Search athletes').getAttribute('value')
    ).toBe('');
  });

  it('navigates to page boundaries and disables unavailable actions', async () => {
    render(<TableFixture />);
    expect(
      screen
        .getByRole('button', { name: 'Go to previous page' })
        .hasAttribute('disabled')
    ).toBe(true);
    activate(screen.getByRole('button', { name: 'Go to last page' }));
    await screen.findByText('Page 3 of 3');
    expect(visibleNames()).toHaveLength(4);
    expect(
      screen
        .getByRole('button', { name: 'Go to next page' })
        .hasAttribute('disabled')
    ).toBe(true);
    activate(screen.getByRole('button', { name: 'Go to first page' }));
    await screen.findByText('Page 1 of 3');
    expect(visibleNames()).toHaveLength(10);
  });

  it('changes page size through the real Select', async () => {
    render(<TableFixture />);
    activate(
      screen
        .getAllByRole('combobox')
        .find(
          (element) => element.getAttribute('data-slot') === 'select-trigger'
        ) ?? screen.getByRole('combobox')
    );
    const option = await screen.findByRole('option', { name: '20' });
    activate(option);
    await screen.findByText('Page 1 of 2');
    expect(visibleNames()).toHaveLength(20);
  });

  it('sorts ascending, descending, and clears sorting using the column menu', async () => {
    render(<TableFixture />);
    activate(screen.getByRole('button', { name: 'Name' }));
    activate(await screen.findByRole('menuitemcheckbox', { name: 'Desc' }));
    await waitFor(() => expect(visibleNames()[0]).toContain('Athlete 24'));
    if (!screen.queryByRole('menuitemcheckbox', { name: 'Asc' }))
      activate(screen.getByRole('button', { name: 'Name' }));
    activate(await screen.findByRole('menuitemcheckbox', { name: 'Asc' }));
    await waitFor(() => expect(visibleNames()[0]).toContain('Athlete 01'));
    if (!screen.queryByRole('menuitem', { name: 'Reset' }))
      activate(screen.getByRole('button', { name: 'Name' }));
    activate(await screen.findByRole('menuitem', { name: 'Reset' }));
    await waitFor(() =>
      expect(screen.queryByRole('menuitem', { name: 'Reset' })).toBeNull()
    );
    expect(visibleNames()[0]).toContain('Athlete 01');
  });

  it('searches and toggles column visibility through the existing Base UI combobox', async () => {
    render(<TableFixture />);
    activate(screen.getByRole('combobox', { name: 'Toggle columns' }));
    const search = await screen.findByPlaceholderText('Search columns...');
    fireEvent.change(search, { target: { value: 'Weight' } });
    const option = await screen.findByRole('option', { name: 'Weight' });
    activate(option);
    await waitFor(() =>
      expect(screen.queryByRole('columnheader', { name: 'Weight' })).toBeNull()
    );
  });

  it('keeps empty and fetching states observable', () => {
    const { rerender } = render(<TableFixture empty />);
    expect(screen.getByText('No results.')).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Go to next page' })
    ).toBeNull();
    rerender(<TableFixture fetching />);
    expect(
      screen
        .getByRole('table')
        .querySelector('tbody')
        ?.getAttribute('aria-busy')
    ).toBe('true');
  });

  it('filters multiple faceted choices and clears their effect', async () => {
    render(<TableFixture />);
    const trigger = screen
      .getAllByRole('combobox')
      .find((element) => element.textContent?.includes('Team'));
    if (!trigger) throw new Error('Team filter trigger was not rendered');
    activate(trigger);
    activate(await screen.findByRole('option', { name: 'North' }));
    await waitFor(() =>
      expect(screen.getByText('0 of 12 rows selected.')).toBeTruthy()
    );
    expect(visibleNames().every((name) => name?.includes('north'))).toBe(true);
    activate(await screen.findByRole('option', { name: 'South' }));
    await waitFor(() =>
      expect(screen.getByText('0 of 24 rows selected.')).toBeTruthy()
    );
    fireEvent.keyDown(screen.getByPlaceholderText('Team'), { key: 'Escape' });
    activate(screen.getByRole('button', { name: 'Reset filters' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Reset filters' })).toBeNull()
    );
    expect(visibleNames()).toHaveLength(10);
  });

  it('keeps typed range bounds synchronized with filtered rows', async () => {
    render(<TableFixture />);
    activate(screen.getByRole('button', { name: 'Weight' }));
    const from = await screen.findByLabelText('From');
    fireEvent.change(from, { target: { value: '60' } });
    await waitFor(() =>
      expect(screen.getByText('0 of 4 rows selected.')).toBeTruthy()
    );
    expect(screen.getByText('Athlete 21')).toBeTruthy();
    expect(screen.queryByText('Athlete 01')).toBeNull();
    expect(screen.getAllByRole('slider')[0].getAttribute('aria-valuenow')).toBe(
      '60'
    );
  });
});
