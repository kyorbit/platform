// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViewModeToggle } from '@/features/dashboard/components/tournament/overview/tournaments-toolbar/view-mode-toggle';

afterEach(cleanup);

describe('shared control consumers', () => {
  it('keeps rendered link refs and both composed click handlers', () => {
    const onButtonClick = vi.fn();
    const onLinkClick = vi.fn();
    const linkRef = createRef<HTMLAnchorElement>();
    render(
      <Button
        nativeButton={false}
        onClick={onButtonClick}
        render={<a href="#roster" ref={linkRef} onClick={onLinkClick} />}
      >
        Open roster
      </Button>
    );
    const link = screen.getByText('Open roster');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('#roster');
    expect(linkRef.current).toBe(link);
    fireEvent.click(link);
    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it('keeps tournament view switching controlled and ignores deselection', async () => {
    function View() {
      const [mode, setMode] = useState<'grid' | 'list'>('grid');
      return (
        <>
          <ViewModeToggle value={mode} onChange={setMode} />
          <output>{mode}</output>
        </>
      );
    }
    render(<View />);
    fireEvent.click(screen.getByLabelText('List view'));
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe('list')
    );
    fireEvent.click(screen.getByLabelText('List view'));
    expect(screen.getByRole('status').textContent).toBe('list');
    fireEvent.click(screen.getByLabelText('Grid view'));
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe('grid')
    );
  });

  it('submits explicit submit buttons once and keeps non-submit and disabled actions inactive', () => {
    const onSubmit = vi.fn();
    const onDisabled = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Button type="submit">Save</Button>
        <Button type="button">Cancel</Button>
        <Button type="button" disabled onClick={onDisabled}>
          Disabled action
        </Button>
      </form>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Disabled action' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onDisabled).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('selects tab panels while keeping disabled panels unavailable', async () => {
    render(
      <Tabs defaultValue="athletes">
        <TabsList>
          <TabsTrigger value="athletes">Athletes</TabsTrigger>
          <TabsTrigger value="divisions">Divisions</TabsTrigger>
          <TabsTrigger value="locked" disabled>
            Locked
          </TabsTrigger>
        </TabsList>
        <TabsContent value="athletes">Athlete panel</TabsContent>
        <TabsContent value="divisions">Division panel</TabsContent>
        <TabsContent value="locked">Locked panel</TabsContent>
      </Tabs>
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Divisions' }), {
      button: 0,
      ctrlKey: false,
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Divisions' }));
    await waitFor(() =>
      expect(screen.getByRole('tabpanel').textContent).toBe('Division panel')
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Locked' }));
    expect(screen.getByRole('tabpanel').textContent).toBe('Division panel');
  });
});
