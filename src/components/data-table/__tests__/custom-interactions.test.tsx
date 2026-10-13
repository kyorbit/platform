// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
} from '@/components/ui/action-bar';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from '@/components/ui/sortable';
import { Button } from '@/components/ui/button';

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

describe('custom table compositions', () => {
  it('keeps action-bar focus navigation in RTL order and skips disabled actions', async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    render(
      <DirectionProvider direction="rtl">
        <ActionBar
          open
          onOpenChange={onOpenChange}
          ref={ref}
          render={<section aria-label="Selected athletes" />}
        >
          <ActionBarGroup>
            <ActionBarItem onClick={onClick}>Edit selection</ActionBarItem>
            <ActionBarItem disabled>Unavailable</ActionBarItem>
            <ActionBarItem>Export selection</ActionBarItem>
          </ActionBarGroup>
          <ActionBarClose aria-label="Clear selection" />
        </ActionBar>
      </DirectionProvider>
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Selected athletes' });
    expect(ref.current).toBe(toolbar);
    expect(toolbar.getAttribute('dir')).toBe('rtl');
    const edit = screen.getByRole('button', { name: 'Edit selection' });
    edit.focus();
    fireEvent.keyDown(edit, { key: 'ArrowLeft' });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Export selection' })
      )
    );
    fireEvent.click(edit);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('honors a canceled Escape and then clears selection on Escape', async () => {
    const onOpenChange = vi.fn();
    const preventDismissal = (event: KeyboardEvent) => event.preventDefault();
    const view = render(
      <ActionBar
        open
        onOpenChange={onOpenChange}
        onEscapeKeyDown={preventDismissal}
      >
        2 selected
      </ActionBar>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();
    view.rerender(
      <ActionBar open onOpenChange={onOpenChange}>
        2 selected
      </ActionBar>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('preserves handle refs, child callbacks and dnd keyboard activation', async () => {
    const childKeyDown = vi.fn();
    const wrapperKeyDown = vi.fn();
    const onDragStart = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Sortable value={['name', 'gender']} onDragStart={onDragStart}>
        <SortableContent render={<ul />}>
          <SortableItem value="name" render={<li style={{ padding: 8 }} />}>
            <SortableItemHandle
              ref={ref}
              onKeyDown={wrapperKeyDown}
              render={<Button onKeyDown={childKeyDown}>Move name</Button>}
            />
          </SortableItem>
          <SortableItem value="gender">Gender</SortableItem>
        </SortableContent>
        <SortableOverlay>
          <div>Dragging field</div>
        </SortableOverlay>
      </Sortable>
    );
    const handle = screen.getByRole('button', { name: 'Move name' });
    expect(ref.current).toBe(handle);
    expect(handle.getAttribute('aria-roledescription')).toBe('sortable');
    handle.focus();
    fireEvent.keyDown(handle, { key: ' ', code: 'Space' });
    await waitFor(() => expect(onDragStart).toHaveBeenCalledTimes(1));
    expect(handle.hasAttribute('data-dragging')).toBe(true);
    expect(screen.getByText('Dragging field')).toBeTruthy();
    expect(childKeyDown).toHaveBeenCalledTimes(1);
    expect(wrapperKeyDown).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(handle, { key: 'Escape', code: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByText('Dragging field')).toBeNull()
    );
  });
});
