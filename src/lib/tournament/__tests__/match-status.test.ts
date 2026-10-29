import { describe, expect, it } from 'vitest';
import { MatchStatusSchema } from '@/contracts/matches/dto';

describe('MatchStatusSchema', () => {
  it('parses valid statuses', () => {
    expect(MatchStatusSchema.parse('pending')).toBe('pending');
    expect(MatchStatusSchema.parse('active')).toBe('active');
    expect(MatchStatusSchema.parse('complete')).toBe('complete');
  });

  it('rejects invalid statuses', () => {
    expect(() => MatchStatusSchema.parse('cancelled')).toThrow();
  });
});
