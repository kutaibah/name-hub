import { CNS_SUFFIX_UNVERIFIED } from './resolve-contract';

export interface DemoEntry {
  name: string;
  partyId: string;
  verified: boolean;
  expiresAt: string | null;
  description: string;
}

const futureDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const pastDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

/** Demo fixtures covering ok, unverified, changed, expired, and missing flows. */
export const DEMO_ENTRIES: Record<string, DemoEntry> = {
  'alice.unverified.cns': {
    name: 'alice.unverified.cns',
    partyId: 'alice::1220f2fe29866fd6a0009ecc8a64ccdc09f1958bd0f801166baaee469d1251b2eb72',
    verified: false,
    expiresAt: futureDate(180),
    description: 'Alice on Canton Network',
  },
  'bob.unverified.cns': {
    name: 'bob.unverified.cns',
    partyId: 'bob::1220a1b2c3d4e5f678901234567890abcdef0123456789abcdef0123456789abcdef',
    verified: false,
    expiresAt: futureDate(90),
    description: "Bob's Canton identity",
  },
  'canton-dev.unverified.cns': {
    name: 'canton-dev.unverified.cns',
    partyId: 'dev-team::1220deadbeef123456789abcdef0123456789abcdef0123456789abcdef01234567',
    verified: false,
    expiresAt: futureDate(365),
    description: 'Canton Developer Resources',
  },
  'bank.cns': {
    name: 'bank.cns',
    partyId: 'acme-bank::1220abcdef123456789012345678901234567890123456789012345678901234abcd',
    verified: true,
    expiresAt: futureDate(365),
    description: 'Verified bank identity',
  },
  'expired-name.unverified.cns': {
    name: 'expired-name.unverified.cns',
    partyId: 'old-user::1220ffffffff9999999999999999999999999999999999999999999999999999999999',
    verified: false,
    expiresAt: pastDate(30),
    description: 'This name has expired',
  },
  'changed-party.unverified.cns': {
    name: 'changed-party.unverified.cns',
    partyId: 'new-owner::1220aaaa1111bbbb2222cccc3333dddd4444eeee5555ffff6666777788889999aaaa',
    verified: false,
    expiresAt: futureDate(60),
    description: 'Party ID changed from previous owner',
  },
};

export function validateDemoEntries(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const [key, entry] of Object.entries(DEMO_ENTRIES)) {
    const hasUnverifiedSuffix = entry.name.endsWith(CNS_SUFFIX_UNVERIFIED);
    if (entry.verified && hasUnverifiedSuffix) {
      errors.push(`Entry "${key}": verified=true but name has .unverified.cns suffix`);
    }
    if (!entry.verified && !hasUnverifiedSuffix) {
      errors.push(`Entry "${key}": verified=false but name lacks .unverified.cns suffix`);
    }
    if (key !== entry.name) {
      errors.push(`Entry key "${key}" doesn't match entry.name "${entry.name}"`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export const DEMO_PARTY_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.values(DEMO_ENTRIES).map((e) => [e.partyId, e.name])
);

/** Old party ID for changed-party demo (triggers CHANGED status). */
export const CHANGED_PARTY_OLD_ID =
  'old-owner::1220bbbb2222cccc3333dddd4444eeee5555ffff6666777788889999aaaabbbbcccc';
