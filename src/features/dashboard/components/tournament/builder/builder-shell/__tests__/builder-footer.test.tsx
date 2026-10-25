// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BuilderFooter } from '../builder-footer';
import type { TournamentData } from '@/contracts/tournament/list';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to: _to, params: _params, search: _search, ...props }: any) => (
    <a href="/dashboard/tournaments/t-1" {...props} />
  ),
}));

afterEach(cleanup);

const tournament = {
  id: 't-1',
  name: 'Spring Open',
  status: 'draft',
} as TournamentData;

function renderFooter(readOnly = false) {
  const handlers = {
    onAutoAssignAll: vi.fn(),
    onActivity: vi.fn(),
    onEditTournament: vi.fn(),
    onDeleteTournament: vi.fn(),
  };
  render(
    <BuilderFooter
      tournament={tournament}
      readOnly={readOnly}
      onAdminStatusIntent={vi.fn()}
      {...handlers}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
  return handlers;
}

describe('BuilderFooter overflow menu', () => {
  it('reaches every secondary action from the menu', async () => {
    const handlers = renderFooter();

    fireEvent.click(await screen.findByRole('menuitem', { name: /Activity/ }));
    expect(handlers.onActivity).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(
      await screen.findByRole('menuitem', { name: /Auto-assign all/ })
    );
    expect(handlers.onAutoAssignAll).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(
      await screen.findByRole('menuitem', { name: /Edit Tournament/ })
    );
    expect(handlers.onEditTournament).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: /Delete/ }));
    expect(handlers.onDeleteTournament).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    expect(
      await screen.findByRole('menuitem', { name: /Command Center/ })
    ).toHaveProperty(
      'href',
      expect.stringContaining('/dashboard/tournaments/t-1')
    );
  });

  it('disables edit actions when read-only', async () => {
    renderFooter(true);

    for (const name of [/Auto-assign all/, /Edit Tournament/, /Delete/]) {
      expect(
        (await screen.findByRole('menuitem', { name })).getAttribute(
          'aria-disabled'
        )
      ).toBe('true');
    }
    expect(
      screen
        .getByRole('menuitem', { name: /Activity/ })
        .getAttribute('aria-disabled')
    ).not.toBe('true');
  });
});
