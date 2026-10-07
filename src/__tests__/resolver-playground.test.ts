import { describe, expect, it } from 'vitest';
import { DEMO_EXAMPLES } from '@/components/marketing/demo-examples';

describe('homepage demo examples', () => {
  it('covers ok and all risky/blocked statuses', () => {
    const statuses = new Set(DEMO_EXAMPLES.map((e) => e.status));
    expect(statuses).toEqual(new Set(['ok', 'unverified', 'changed', 'expired', 'missing']));
  });

  it('uses short inputs that match package README demo names', () => {
    const inputs = DEMO_EXAMPLES.map((e) => e.input);
    expect(inputs).toContain('bank');
    expect(inputs).toContain('alice');
    expect(inputs).toContain('changed-party');
    expect(inputs).toContain('expired-name');
  });
});
