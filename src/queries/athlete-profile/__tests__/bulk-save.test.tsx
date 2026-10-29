// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { client } from '@/orpc/client';
import { useBulkSaveAthleteProfiles } from '@/queries/athlete-profile/use-athlete-profile-mutations';

vi.mock('@/orpc/client', () => ({
  client: { athleteProfile: { create: vi.fn(), update: vi.fn() } },
}));

const row = {
  athleteCode: 'A1',
  name: 'Kim',
  gender: 'F' as const,
  beltLevel: 1,
  weight: 50,
  affiliation: 'Club',
};

describe('useBulkSaveAthleteProfiles', () => {
  it('counts partial failures and invalidates once', async () => {
    vi.mocked(client.athleteProfile.create)
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce(new Error('duplicate'));
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useBulkSaveAthleteProfiles(), {
      wrapper,
    });

    const counts = await result.current.mutateAsync({
      kind: 'create',
      rows: [row, { ...row, athleteCode: 'A2' }],
    });

    expect(counts).toEqual({ successCount: 1, failCount: 1 });
    expect(client.athleteProfile.update).not.toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['athleteProfile'] });
    expect(
      invalidate.mock.calls.filter(
        ([f]) => f?.queryKey?.[0] === 'athleteProfile'
      )
    ).toHaveLength(1);
  });
});
