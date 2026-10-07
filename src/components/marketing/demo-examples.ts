export const DEMO_EXAMPLES = [
  { input: 'bank', label: 'bank', status: 'ok' as const, hint: 'Verified — safe immediately' },
  { input: 'alice', label: 'alice', status: 'unverified' as const, hint: 'Confirm before send' },
  { input: 'changed-party', label: 'changed-party', status: 'changed' as const, hint: 'Party ID changed' },
  { input: 'expired-name', label: 'expired-name', status: 'expired' as const, hint: 'Blocked' },
  { input: 'nonexistent', label: 'nonexistent', status: 'missing' as const, hint: 'Not found — blocked' },
] as const;

export type DemoExampleStatus = (typeof DEMO_EXAMPLES)[number]['status'];
