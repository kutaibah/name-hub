import type { AnsEntry, UserAnsEntry, ResolvedName } from './types';

const futureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const pastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const DEMO_PARTY_ID = 'demo-user::122034abcd5678ef90123456789abcdef01234567890abcdef1234567890abcdef';

export const DEMO_ENTRIES: Record<string, AnsEntry> = {
  'alice.unverified.cns': {
    contract_id: 'demo-contract-alice-001',
    user: 'alice::1220f2fe29866fd6a0009ecc8a64ccdc09f1958bd0f801166baaee469d1251b2eb72',
    name: 'alice.unverified.cns',
    url: 'https://alice.example.com',
    description: 'Alice on Canton Network',
    expires_at: futureDate(180),
  },
  'bob.unverified.cns': {
    contract_id: 'demo-contract-bob-002',
    user: 'bob::1220a1b2c3d4e5f678901234567890abcdef0123456789abcdef0123456789abcdef',
    name: 'bob.unverified.cns',
    url: '',
    description: 'Bob\'s Canton identity',
    expires_at: futureDate(90),
  },
  'canton-dev.unverified.cns': {
    contract_id: 'demo-contract-dev-003',
    user: 'dev-team::1220deadbeef123456789abcdef0123456789abcdef0123456789abcdef01234567',
    name: 'canton-dev.unverified.cns',
    url: 'https://canton.network',
    description: 'Canton Developer Resources',
    expires_at: futureDate(365),
  },
  'expired-name.unverified.cns': {
    contract_id: 'demo-contract-expired-004',
    user: 'old-user::1220ffffffff9999999999999999999999999999999999999999999999999999999999',
    name: 'expired-name.unverified.cns',
    url: '',
    description: 'This name has expired',
    expires_at: pastDate(30),
  },
  'demo-user.unverified.cns': {
    contract_id: 'demo-contract-user-005',
    user: DEMO_PARTY_ID,
    name: 'demo-user.unverified.cns',
    url: 'https://demo.example.com',
    description: 'Demo user account',
    expires_at: futureDate(60),
  },
  'my-test-name.unverified.cns': {
    contract_id: 'demo-contract-test-006',
    user: DEMO_PARTY_ID,
    name: 'my-test-name.unverified.cns',
    url: '',
    description: 'Test registration',
    expires_at: futureDate(30),
  },
};

export const DEMO_USER_ENTRIES: UserAnsEntry[] = [
  {
    contractId: 'demo-contract-user-005',
    name: 'demo-user.unverified.cns',
    amount: '1.0',
    unit: 'CC',
    expiresAt: futureDate(60),
    paymentInterval: 'P30D',
    paymentDuration: 'P30D',
  },
  {
    contractId: 'demo-contract-test-006',
    name: 'my-test-name.unverified.cns',
    amount: '1.0',
    unit: 'CC',
    expiresAt: futureDate(30),
    paymentInterval: 'P30D',
    paymentDuration: 'P30D',
  },
];

export const DEMO_TAKEN_NAMES = new Set(Object.keys(DEMO_ENTRIES));

export function isDemoNameTaken(canonicalName: string): boolean {
  return DEMO_TAKEN_NAMES.has(canonicalName);
}

export function getDemoEntry(canonicalName: string): AnsEntry | null {
  return DEMO_ENTRIES[canonicalName] ?? null;
}

export function searchDemoEntries(prefix: string, limit: number): AnsEntry[] {
  const normalizedPrefix = prefix.toLowerCase();
  return Object.values(DEMO_ENTRIES)
    .filter(entry => entry.name.toLowerCase().startsWith(normalizedPrefix))
    .slice(0, limit);
}

export function getDemoUserEntries(): UserAnsEntry[] {
  return DEMO_USER_ENTRIES;
}

export function getDemoEntryByParty(partyId: string): AnsEntry | null {
  return Object.values(DEMO_ENTRIES).find(entry => entry.user === partyId) ?? null;
}

export type DemoRegistrationScenario = 
  | 'success'
  | 'rejected_approval'
  | 'insufficient_funds'
  | 'processing_slow'
  | 'service_error';

let currentDemoScenario: DemoRegistrationScenario = 'success';

export function setDemoScenario(scenario: DemoRegistrationScenario): void {
  currentDemoScenario = scenario;
}

export function getDemoScenario(): DemoRegistrationScenario {
  return currentDemoScenario;
}

export const DEMO_REGISTRATION_CONFIG = {
  entryFee: '1.0',
  feeUnit: 'CC',
  lifetimeDays: 30,
  renewalInterval: '30 days',
};

export function createDemoEntry(name: string, partyId: string, url: string, description: string): AnsEntry {
  return {
    contract_id: `demo-contract-new-${Date.now()}`,
    user: partyId,
    name,
    url,
    description,
    expires_at: futureDate(DEMO_REGISTRATION_CONFIG.lifetimeDays),
  };
}

export function toResolvedName(entry: AnsEntry, network: string, isDemo: boolean): ResolvedName {
  const expiresAt = entry.expires_at ?? null;
  return {
    canonicalName: entry.name,
    partyId: entry.user,
    url: entry.url,
    description: entry.description,
    expiresAt,
    network,
    isExpired: expiresAt ? new Date(expiresAt) < new Date() : false,
    isDemo,
  };
}
