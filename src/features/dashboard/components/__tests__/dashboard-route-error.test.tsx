// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import {
  RouterContextProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DashboardRouteError } from '../dashboard-route-error';

afterEach(cleanup);

function renderError(error: unknown) {
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <RouterContextProvider router={router}>
      <DashboardRouteError error={error} reset={vi.fn()} />
    </RouterContextProvider>
  );
}

describe('dashboard route errors', () => {
  it('shows the message from an Error instance', () => {
    renderError(new Error('Unable to load athletes'));
    expect(screen.getByText('Unable to load athletes')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
  });

  it('preserves a serialized not-found error message', () => {
    renderError({ code: 'NOT_FOUND', message: 'This page was deleted' });
    expect(screen.getByText('Not found')).toBeDefined();
    expect(screen.getByText('This page was deleted')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it.each([null, 'failure', { message: { detail: 'failure' } }])(
    'renders a safe fallback for a thrown value without a string message: %j',
    (error) => {
      renderError(error);
      expect(screen.getByText('Failed to load this page.')).toBeDefined();
    }
  );

  it('uses the not-found fallback when its message is not a string', () => {
    renderError({ code: 'NOT_FOUND', message: 404 });
    expect(
      screen.getByText(
        "The page you're looking for might have been moved or doesn't exist."
      )
    ).toBeDefined();
  });
});
