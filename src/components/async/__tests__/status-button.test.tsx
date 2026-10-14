// @vitest-environment jsdom

import { StrictMode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StatusButton } from '../status-button';
import { useStatusButton } from '../use-status-button';
import { CopyButton } from '@/components/ui/copy-button';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise<T>((complete, fail) => {
    resolve = complete;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe('StatusButton', () => {
  it('keeps focus, blocks duplicate clicks, shows success, and becomes usable again', async () => {
    const request = deferred<void>();
    const onClick = vi.fn(() => request.promise);
    render(
      <StatusButton onClick={onClick} successLabel="Saved" successDuration={50}>
        Save
      </StatusButton>
    );
    const button = screen.getByRole('button', { name: 'Save' });
    button.focus();
    act(() => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(document.activeElement).toBe(button);
    await act(() => {
      request.resolve();
      return request.promise;
    });
    expect(button.getAttribute('data-status')).toBe('success');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(button.getAttribute('data-status')).toBe('idle')
    );
    expect(document.activeElement).toBe(button);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not turn validation returns into success or submit a busy form', async () => {
    const validate = vi.fn();
    const submit = vi.fn((event: React.SubmitEvent<HTMLFormElement>) =>
      event.preventDefault()
    );
    const view = render(
      <form onSubmit={submit}>
        <StatusButton
          type="submit"
          status="idle"
          onClick={validate}
          successLabel="Created"
        >
          Create
        </StatusButton>
      </form>
    );
    const button = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(button);
    await act(async () => {});
    expect(button.getAttribute('data-status')).toBe('idle');
    expect(submit).toHaveBeenCalledTimes(1);
    view.rerender(
      <form onSubmit={submit}>
        <StatusButton
          type="submit"
          status="loading"
          onClick={validate}
          successLabel="Created"
        >
          Create
        </StatusButton>
      </form>
    );
    fireEvent.click(button);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('expires mutation success feedback without clearing data and allows retries after errors', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const first = deferred<string>();
    const retry = deferred<string>();
    const mutationFn = vi
      .fn(() => Promise.resolve('saved'))
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(retry.promise)
      .mockResolvedValue('saved');
    function Save() {
      const mutation = useMutation({ mutationFn });
      const button = useStatusButton(mutation.status);
      return (
        <>
          <StatusButton
            {...button}
            onClick={() => mutation.mutate()}
            successLabel="Saved"
            successDuration={100}
          >
            Save
          </StatusButton>
          <output aria-label="Mutation result">
            {mutation.data ?? mutation.status}
          </output>
        </>
      );
    }
    render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <Save />
        </QueryClientProvider>
      </StrictMode>
    );
    const button = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(button);
    await waitFor(() =>
      expect(button.getAttribute('data-status')).toBe('loading')
    );
    await act(() => {
      first.reject(new Error('Offline'));
      return first.promise.catch(() => {});
    });
    await waitFor(() =>
      expect(button.getAttribute('data-status')).toBe('idle')
    );
    expect(screen.getByLabelText('Mutation result').textContent).toBe('error');
    fireEvent.click(button);
    await waitFor(() =>
      expect(button.getAttribute('data-status')).toBe('loading')
    );
    await act(() => {
      retry.resolve('saved');
      return retry.promise;
    });
    await waitFor(() =>
      expect(button.getAttribute('data-status')).toBe('success')
    );
    await waitFor(() =>
      expect(button.getAttribute('data-status')).toBe('idle')
    );
    expect(screen.getByLabelText('Mutation result').textContent).toBe('saved');
    fireEvent.click(button);
    await waitFor(() => expect(mutationFn).toHaveBeenCalledTimes(3));
    client.clear();
  });

  it('tracks clipboard loading and leaves failed copies retryable', async () => {
    const request = deferred<void>();
    const writeText = vi
      .fn()
      .mockReturnValueOnce(request.promise)
      .mockResolvedValue(undefined);
    const onCopyError = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(
      <CopyButton size="default" text="bracket" onCopyError={onCopyError}>
        Copy
      </CopyButton>
    );
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);
    expect(button.getAttribute('data-status')).toBe('loading');
    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledTimes(1);
    await act(() => {
      request.reject(new Error('Permission denied'));
      return request.promise.catch(() => {});
    });
    expect(button.getAttribute('data-status')).toBe('idle');
    expect(onCopyError).toHaveBeenCalledTimes(1);
    fireEvent.click(button);
    await waitFor(() =>
      expect(button.getAttribute('data-status')).toBe('success')
    );
    expect(writeText).toHaveBeenCalledTimes(2);
  });
});
