import { describe, it, expect, beforeEach } from 'vitest';
import { 
  DEMO_ENTRIES,
  DEMO_PARTY_ID,
  isDemoNameTaken,
  getDemoEntry,
  searchDemoEntries,
  getDemoUserEntries,
  getDemoEntryByParty,
  setDemoScenario,
  getDemoScenario,
  DEMO_REGISTRATION_CONFIG,
} from '@/lib/cns/demo-fixtures';

describe('DEMO_ENTRIES', () => {
  it('contains expected demo names', () => {
    expect(DEMO_ENTRIES['alice.unverified.cns']).toBeDefined();
    expect(DEMO_ENTRIES['bob.unverified.cns']).toBeDefined();
  });

  it('has valid entry structure', () => {
    const alice = DEMO_ENTRIES['alice.unverified.cns'];
    expect(alice.user).toBeDefined();
    expect(alice.name).toBe('alice.unverified.cns');
    expect(alice.contract_id).toBeDefined();
  });
});

describe('isDemoNameTaken', () => {
  it('returns true for existing names', () => {
    expect(isDemoNameTaken('alice.unverified.cns')).toBe(true);
    expect(isDemoNameTaken('bob.unverified.cns')).toBe(true);
  });

  it('returns false for non-existing names', () => {
    expect(isDemoNameTaken('nonexistent.unverified.cns')).toBe(false);
    expect(isDemoNameTaken('random-name.unverified.cns')).toBe(false);
  });
});

describe('getDemoEntry', () => {
  it('returns entry for existing name', () => {
    const entry = getDemoEntry('alice.unverified.cns');
    expect(entry).not.toBeNull();
    expect(entry?.name).toBe('alice.unverified.cns');
  });

  it('returns null for non-existing name', () => {
    const entry = getDemoEntry('nonexistent.unverified.cns');
    expect(entry).toBeNull();
  });
});

describe('searchDemoEntries', () => {
  it('returns entries matching prefix', () => {
    const results = searchDemoEntries('alice', 10);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('alice');
  });

  it('respects limit parameter', () => {
    const results = searchDemoEntries('', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('returns empty array for no matches', () => {
    const results = searchDemoEntries('zzzznonexistent', 10);
    expect(results.length).toBe(0);
  });
});

describe('getDemoUserEntries', () => {
  it('returns array of user entries', () => {
    const entries = getDemoUserEntries();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('entries have required fields', () => {
    const entries = getDemoUserEntries();
    for (const entry of entries) {
      expect(entry.contractId).toBeDefined();
      expect(entry.name).toBeDefined();
      expect(entry.amount).toBeDefined();
      expect(entry.expiresAt).toBeDefined();
    }
  });
});

describe('getDemoEntryByParty', () => {
  it('returns entry for demo party ID', () => {
    const entry = getDemoEntryByParty(DEMO_PARTY_ID);
    expect(entry).not.toBeNull();
  });

  it('returns null for unknown party', () => {
    const entry = getDemoEntryByParty('unknown-party-id');
    expect(entry).toBeNull();
  });
});

describe('demo scenario management', () => {
  beforeEach(() => {
    setDemoScenario('success');
  });

  it('default scenario is success', () => {
    expect(getDemoScenario()).toBe('success');
  });

  it('can change scenario', () => {
    setDemoScenario('rejected_approval');
    expect(getDemoScenario()).toBe('rejected_approval');

    setDemoScenario('insufficient_funds');
    expect(getDemoScenario()).toBe('insufficient_funds');
  });
});

describe('DEMO_REGISTRATION_CONFIG', () => {
  it('has expected configuration', () => {
    expect(DEMO_REGISTRATION_CONFIG.entryFee).toBeDefined();
    expect(DEMO_REGISTRATION_CONFIG.feeUnit).toBe('CC');
    expect(DEMO_REGISTRATION_CONFIG.lifetimeDays).toBeGreaterThan(0);
  });
});

describe('DEMO_PARTY_ID', () => {
  it('is a valid party ID format', () => {
    expect(DEMO_PARTY_ID).toContain('::');
    expect(DEMO_PARTY_ID.length).toBeGreaterThan(20);
  });
});
