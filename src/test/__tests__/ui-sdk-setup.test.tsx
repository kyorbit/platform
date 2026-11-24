// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { Button } from '@ui-sdk/react/button';
import { createAgent } from '@ui-sdk/react/agent';
import { describe, expect, it, vi } from 'vitest';
import { setupUiSdkJsdom } from '../ui-sdk-setup';

setupUiSdkJsdom();

describe('ui-sdk test harness', () => {
  it('enables strict mode and exposes ui-sdk Button to the agent bridge', async () => {
    const onClick = vi.fn();
    const agent = createAgent();

    render(<Button onClick={onClick}>Fit bracket to view</Button>);

    expect(globalThis.__UI_SDK_STRICT__).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Fit bracket to view' })
    ).toBeTruthy();

    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== 'more');

    expect(components.map((entry) => entry.label)).toContain(
      'Fit bracket to view'
    );

    const result = await agent.act({
      steps: [{ ref: 'Fit bracket to view', action: 'press' }],
    });

    expect(result.ok, result.error?.message).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
