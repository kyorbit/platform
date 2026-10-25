// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { BuilderFooter } from '../builder-footer';
import { BuilderFooterPortal, BuilderFooterProvider } from '../footer-portal';
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
    <BuilderFooterProvider>
      <BuilderFooter
        tournament={tournament}
        readOnly={readOnly}
        onAdminStatusIntent={vi.fn()}
        {...handlers}
      />
    </BuilderFooterProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
  return handlers;
}

describe('BuilderFooter pane buttons', () => {
  it('shows portalled pane buttons after the overflow menu', () => {
    render(
      <BuilderFooterProvider>
        <BuilderFooter
          tournament={tournament}
          readOnly={false}
          onAdminStatusIntent={vi.fn()}
          onActivity={vi.fn()}
          onEditTournament={vi.fn()}
          onDeleteTournament={vi.fn()}
        />
        <BuilderFooterPortal>
          <button aria-label="Athlete pool" />
          <button aria-label="Division list" />
        </BuilderFooterPortal>
      </BuilderFooterProvider>
    );

    const footer = within(screen.getByRole('contentinfo'));
    const labels = footer
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'))
      .filter(Boolean);
    expect(labels).toEqual(['More actions', 'Athlete pool', 'Division list']);
  });
});

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
