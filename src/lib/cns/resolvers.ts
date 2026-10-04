import type { Resolver, ResolveOptions, ResolveResult, ResolveInput, MissingResult } from './resolve-contract';
import {
  parseInput,
  validateCnsName,
  validatePartyId,
  createMissingResult,
  createExpiredResult,
  createUnverifiedResult,
  createChangedResult,
  createOkResult,
  getCachedLastKnown,
  setCachedLastKnown,
  ResolveResultSchema,
  CNS_SUFFIX_UNVERIFIED,
  CNS_SUFFIX_VERIFIED,
} from './resolve-contract';
import { cnsConfig } from './config';
import { LookupEntryByNameResponseSchema } from './types';

/**
 * Demo name entries with various statuses for testing all states.
 */
interface DemoEntry {
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

/**
 * Demo entries covering all statuses:
 * - alice: OK (unverified but usable, standard case)
 * - bob: OK (unverified but usable)
 * - bank: OK (verified - rare but exists)
 * - expired-name: EXPIRED
 * - changed-party: For testing CHANGED status (partyId differs from cached)
 */
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
    description: 'Bob\'s Canton identity',
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

/**
 * Validates that demo entries are consistent:
 * - Verified names must NOT have the .unverified.cns suffix
 * - Unverified names MUST have the .unverified.cns suffix
 */
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

/**
 * Demo party ID to name mapping for reverse lookups.
 */
const DEMO_PARTY_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.values(DEMO_ENTRIES).map(e => [e.partyId, e.name])
);

/**
 * Old party ID for changed-party demo (to trigger CHANGED status).
 */
const CHANGED_PARTY_OLD_ID = 'old-owner::1220bbbb2222cccc3333dddd4444eeee5555ffff6666777788889999aaaabbbbcccc';

/**
 * Simulates network delay for demo mode.
 */
async function demoDelay(ms: number = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 100));
}

/**
 * Demo resolver implementation.
 * Returns seeded demo data for all status types.
 */
export class DemoResolver implements Resolver {
  async resolve(inputStr: string, opts?: ResolveOptions): Promise<ResolveResult> {
    await demoDelay();

    if (opts?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const input = parseInput(inputStr);
    const source = 'demo' as const;

    // Handle party ID input
    if (input.kind === 'partyId') {
      const validation = validatePartyId(input.raw);
      if (!validation.valid) {
        return createMissingResult(input, 'INVALID_INPUT', source);
      }

      const name = DEMO_PARTY_TO_NAME[input.normalized];
      if (!name) {
        return createMissingResult(input, 'PARTY_NOT_FOUND', source);
      }

      const entry = DEMO_ENTRIES[name];
      if (!entry) {
        return createMissingResult(input, 'PARTY_NOT_FOUND', source);
      }

      // Party ID lookup returns OK (verified entries are fully OK)
      if (entry.verified) {
        return createOkResult(input, entry.partyId, entry.name, true, entry.expiresAt, source);
      }
      // Unverified entries require confirmation
      return createUnverifiedResult(input, entry.partyId, entry.name, entry.expiresAt, source);
    }

    // Handle name input
    const validation = validateCnsName(input.raw);
    if (!validation.valid) {
      return createMissingResult(input, 'INVALID_INPUT', source, input.normalized);
    }

    // Try to find the entry - check both normalized name and verified variant
    let entry = DEMO_ENTRIES[input.normalized];
    let resolvedName = input.normalized;
    
    // If not found and input was normalized to .unverified.cns, also check .cns (verified)
    if (!entry && input.normalized.endsWith(CNS_SUFFIX_UNVERIFIED)) {
      const baseName = input.normalized.slice(0, -CNS_SUFFIX_UNVERIFIED.length);
      const verifiedName = `${baseName}${CNS_SUFFIX_VERIFIED}`;
      entry = DEMO_ENTRIES[verifiedName];
      if (entry) {
        resolvedName = verifiedName;
      }
    }
    
    if (!entry) {
      return createMissingResult(input, 'NAME_NOT_FOUND', source, input.normalized);
    }

    // Check if expired
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      return createExpiredResult(input, entry.name, entry.verified, entry.expiresAt, source);
    }

    // Check for party change
    const lastKnown = opts?.lastKnown ?? getCachedLastKnown(resolvedName);
    const knownPartyId = opts?.knownPartyId ?? lastKnown?.partyId;

    // Special handling for changed-party demo: simulate old cached value
    if (resolvedName === 'changed-party.unverified.cns' && !knownPartyId) {
      // First time seeing this name, cache the "old" party ID to demonstrate change
      setCachedLastKnown(resolvedName, CHANGED_PARTY_OLD_ID);
      return createChangedResult(
        input,
        entry.partyId,
        CHANGED_PARTY_OLD_ID,
        entry.name,
        entry.verified,
        entry.expiresAt,
        source
      );
    }

    if (knownPartyId && knownPartyId !== entry.partyId) {
      return createChangedResult(
        input,
        entry.partyId,
        knownPartyId,
        entry.name,
        entry.verified,
        entry.expiresAt,
        source
      );
    }

    // Cache for future change detection
    setCachedLastKnown(resolvedName, entry.partyId);

    // Verified names are OK
    if (entry.verified) {
      return createOkResult(input, entry.partyId, entry.name, true, entry.expiresAt, source);
    }

    // Unverified names require confirmation
    return createUnverifiedResult(input, entry.partyId, entry.name, entry.expiresAt, source);
  }
}

/**
 * Live resolver implementation.
 * Uses Scan API for real lookups.
 */
export class LiveResolver implements Resolver {
  private baseUrl: string;

  constructor(scanApiUrl: string) {
    this.baseUrl = scanApiUrl;
  }

  async resolve(inputStr: string, opts?: ResolveOptions): Promise<ResolveResult> {
    const input = parseInput(inputStr);
    const source = 'live' as const;

    // Handle party ID input
    if (input.kind === 'partyId') {
      const validation = validatePartyId(input.raw);
      if (!validation.valid) {
        return createMissingResult(input, 'INVALID_INPUT', source);
      }

      try {
        const response = await fetch(
          `${this.baseUrl}/v0/ans-entries/by-party/${encodeURIComponent(input.normalized)}`,
          { signal: opts?.signal }
        );

        if (response.status === 404) {
          return createMissingResult(input, 'PARTY_NOT_FOUND', source);
        }

        if (!response.ok) {
          return this.createUnavailableResult(input);
        }

        const data = await response.json();
        const entry = data.entry;
        if (!entry) {
          return createMissingResult(input, 'PARTY_NOT_FOUND', source);
        }

        const name = entry.name;
        const partyId = entry.user;
        const expiresAt = entry.expires_at ?? null;
        const verified = !name.endsWith(CNS_SUFFIX_UNVERIFIED);

        if (expiresAt && new Date(expiresAt) < new Date()) {
          return createExpiredResult(input, name, verified, expiresAt, source);
        }

        if (verified) {
          return createOkResult(input, partyId, name, true, expiresAt, source);
        }

        return createUnverifiedResult(input, partyId, name, expiresAt, source);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }
        return this.createUnavailableResult(input);
      }
    }

    // Handle name input
    const validation = validateCnsName(input.raw);
    if (!validation.valid) {
      return createMissingResult(input, 'INVALID_INPUT', source, input.normalized);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/v0/ans-entries/by-name/${encodeURIComponent(input.normalized)}`,
        { signal: opts?.signal }
      );

      if (response.status === 404) {
        return createMissingResult(input, 'NAME_NOT_FOUND', source, input.normalized);
      }

      if (!response.ok) {
        return this.createUnavailableResult(input);
      }

      const data = await response.json();
      const parsed = LookupEntryByNameResponseSchema.safeParse(data);
      if (!parsed.success) {
        return this.createUnavailableResult(input);
      }

      const entry = parsed.data.entry;
      const partyId = entry.user;
      const expiresAt = entry.expires_at ?? null;
      const verified = !entry.name.endsWith(CNS_SUFFIX_UNVERIFIED);

      // Check if expired
      if (expiresAt && new Date(expiresAt) < new Date()) {
        return createExpiredResult(input, entry.name, verified, expiresAt, source);
      }

      // Check for party change
      const lastKnown = opts?.lastKnown ?? getCachedLastKnown(input.normalized);
      const knownPartyId = opts?.knownPartyId ?? lastKnown?.partyId;

      if (knownPartyId && knownPartyId !== partyId) {
        return createChangedResult(
          input,
          partyId,
          knownPartyId,
          entry.name,
          verified,
          expiresAt,
          source
        );
      }

      // Cache for future change detection
      setCachedLastKnown(input.normalized, partyId);

      // Verified names are OK
      if (verified) {
        return createOkResult(input, partyId, entry.name, true, expiresAt, source);
      }

      // Unverified names require confirmation
      return createUnverifiedResult(input, partyId, entry.name, expiresAt, source);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      return this.createUnavailableResult(input);
    }
  }

  private createUnavailableResult(input: ResolveInput): MissingResult {
    return createMissingResult(input, 'RESOLVER_UNAVAILABLE', 'live', input.kind === 'name' ? input.normalized : undefined);
  }
}

/**
 * Get the appropriate resolver based on mode.
 */
let resolverInstance: Resolver | null = null;

export function getResolver(): Resolver {
  if (!resolverInstance) {
    const isDemoMode = cnsConfig.mode === 'demo';
    resolverInstance = isDemoMode
      ? new DemoResolver()
      : new LiveResolver(cnsConfig.scanApiUrl);
  }
  return resolverInstance;
}

/**
 * Reset the resolver instance (for testing).
 */
export function resetResolver(): void {
  resolverInstance = null;
}

/**
 * Validate a ResolveResult against the schema.
 * Throws if invalid.
 */
export function validateResolveResult(result: ResolveResult): ResolveResult {
  return ResolveResultSchema.parse(result);
}
