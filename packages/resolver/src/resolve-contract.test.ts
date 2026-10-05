import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ResolveResultSchema,
  ResolveStatusSchema,
  ReasonCodeSchema,
  ResolveInputSchema,
  parseInput,
  detectInputKind,
  normalizeInput,
  validateCnsName,
  validatePartyId,
  createMissingResult,
  createExpiredResult,
  createUnverifiedResult,
  createChangedResult,
  createOkResult,
  getReasonMessage,
  ReasonCode,
  getCachedLastKnown,
  setCachedLastKnown,
  clearCachedLastKnown,
} from './resolve-contract';
import { DemoResolver, validateResolveResult, validateDemoEntries, DEMO_ENTRIES } from './index';
import { CNS_SUFFIX_UNVERIFIED } from './resolve-contract';

describe('Resolve Contract Schemas', () => {
  describe('ReasonCodeSchema', () => {
    it('accepts valid reason codes', () => {
      expect(ReasonCodeSchema.parse('OK')).toBe('OK');
      expect(ReasonCodeSchema.parse('INVALID_INPUT')).toBe('INVALID_INPUT');
      expect(ReasonCodeSchema.parse('NAME_NOT_FOUND')).toBe('NAME_NOT_FOUND');
      expect(ReasonCodeSchema.parse('PARTY_NOT_FOUND')).toBe('PARTY_NOT_FOUND');
      expect(ReasonCodeSchema.parse('NAME_EXPIRED')).toBe('NAME_EXPIRED');
      expect(ReasonCodeSchema.parse('NAME_UNVERIFIED')).toBe('NAME_UNVERIFIED');
      expect(ReasonCodeSchema.parse('PARTY_CHANGED_SINCE_LAST_RESOLUTION')).toBe('PARTY_CHANGED_SINCE_LAST_RESOLUTION');
      expect(ReasonCodeSchema.parse('RESOLVER_UNAVAILABLE')).toBe('RESOLVER_UNAVAILABLE');
    });

    it('rejects invalid reason codes', () => {
      expect(() => ReasonCodeSchema.parse('UNKNOWN')).toThrow();
      expect(() => ReasonCodeSchema.parse('')).toThrow();
    });
  });

  describe('ResolveStatusSchema', () => {
    it('accepts valid statuses', () => {
      expect(ResolveStatusSchema.parse('ok')).toBe('ok');
      expect(ResolveStatusSchema.parse('missing')).toBe('missing');
      expect(ResolveStatusSchema.parse('expired')).toBe('expired');
      expect(ResolveStatusSchema.parse('unverified')).toBe('unverified');
      expect(ResolveStatusSchema.parse('changed')).toBe('changed');
    });

    it('rejects invalid statuses', () => {
      expect(() => ResolveStatusSchema.parse('invalid')).toThrow();
      expect(() => ResolveStatusSchema.parse('error')).toThrow();
    });
  });

  describe('ResolveInputSchema', () => {
    it('validates input structure', () => {
      const input = { raw: 'alice', normalized: 'alice.unverified.cns', kind: 'name' as const };
      expect(ResolveInputSchema.parse(input)).toEqual(input);
    });

    it('validates party ID input', () => {
      const input = { raw: 'alice::1234', normalized: 'alice::1234', kind: 'partyId' as const };
      expect(ResolveInputSchema.parse(input)).toEqual(input);
    });
  });
});

describe('Input Detection and Normalization', () => {
  describe('detectInputKind', () => {
    it('detects CNS names', () => {
      expect(detectInputKind('alice')).toBe('name');
      expect(detectInputKind('alice.unverified.cns')).toBe('name');
      expect(detectInputKind('my-name')).toBe('name');
      expect(detectInputKind('  alice  ')).toBe('name');
    });

    it('detects party IDs', () => {
      expect(detectInputKind('alice::1220f2fe29866fd6a0009ecc8a64ccdc09f1958bd0f801166baaee469d1251b2eb72')).toBe('partyId');
      expect(detectInputKind('bob::1220a1b2c3d4e5f678901234567890abcdef0123456789abcdef0123456789abcdef')).toBe('partyId');
    });
  });

  describe('normalizeInput', () => {
    it('normalizes names to lowercase with .unverified.cns suffix by default', () => {
      expect(normalizeInput('Alice', 'name')).toBe('alice.unverified.cns');
      expect(normalizeInput('ALICE', 'name')).toBe('alice.unverified.cns');
      expect(normalizeInput('alice.unverified.cns', 'name')).toBe('alice.unverified.cns');
      expect(normalizeInput('  alice  ', 'name')).toBe('alice.unverified.cns');
    });

    it('preserves .cns suffix for verified names', () => {
      expect(normalizeInput('bank.cns', 'name')).toBe('bank.cns');
      expect(normalizeInput('BANK.CnS', 'name')).toBe('bank.cns');
      expect(normalizeInput('  bank.cns  ', 'name')).toBe('bank.cns');
    });

    it('preserves party ID case', () => {
      const partyId = 'alice::1220ABCD';
      expect(normalizeInput(partyId, 'partyId')).toBe('alice::1220ABCD');
    });
  });

  describe('parseInput', () => {
    it('parses and normalizes name input', () => {
      const result = parseInput('Alice');
      expect(result.raw).toBe('Alice');
      expect(result.normalized).toBe('alice.unverified.cns');
      expect(result.kind).toBe('name');
    });

    it('parses party ID input', () => {
      const partyId = 'alice::1220f2fe29866fd6a0009ecc8a64ccdc09f1958bd0f801166baaee469d1251b2eb72';
      const result = parseInput(partyId);
      expect(result.raw).toBe(partyId);
      expect(result.normalized).toBe(partyId);
      expect(result.kind).toBe('partyId');
    });
  });
});

describe('Validation Functions', () => {
  describe('validateCnsName', () => {
    it('accepts valid names', () => {
      expect(validateCnsName('alice')).toEqual({ valid: true });
      expect(validateCnsName('alice123')).toEqual({ valid: true });
      expect(validateCnsName('my-name')).toEqual({ valid: true });
      expect(validateCnsName('a1b2c3')).toEqual({ valid: true });
    });

    it('rejects names too short', () => {
      expect(validateCnsName('ab')).toEqual({ valid: false, reason: expect.stringContaining('at least 3') });
    });

    it('rejects names too long', () => {
      const longName = 'a'.repeat(64);
      expect(validateCnsName(longName)).toEqual({ valid: false, reason: expect.stringContaining('at most 63') });
    });

    it('rejects invalid characters', () => {
      expect(validateCnsName('alice_test')).toEqual({ valid: false, reason: expect.stringContaining('lowercase') });
      expect(validateCnsName('Alice')).toEqual({ valid: true });
      expect(validateCnsName('-alice')).toEqual({ valid: false, reason: expect.stringContaining('lowercase') });
    });
  });

  describe('validatePartyId', () => {
    it('accepts valid party IDs', () => {
      expect(validatePartyId('alice::1220f2fe29866fd6a0009ecc8a64ccdc09f1958bd0f801166baaee469d1251b2eb72')).toEqual({ valid: true });
    });

    it('rejects invalid party IDs', () => {
      expect(validatePartyId('alice')).toEqual({ valid: false, reason: expect.stringContaining('Invalid') });
      expect(validatePartyId('alice::')).toEqual({ valid: false, reason: expect.stringContaining('Invalid') });
    });
  });
});

describe('Result Builders', () => {
  const mockInput = { raw: 'alice', normalized: 'alice.unverified.cns', kind: 'name' as const };

  it('createMissingResult creates valid missing result', () => {
    const result = createMissingResult(mockInput, 'NAME_NOT_FOUND', 'demo', 'alice.unverified.cns');
    expect(result.status).toBe('missing');
    expect(result.partyId).toBeNull();
    expect(result.reasonCode).toBe('NAME_NOT_FOUND');
    expect(result.requiresConfirmation).toBe(false);
    expect(result.blocking).toBe(true);
    expect(ResolveResultSchema.parse(result)).toEqual(result);
  });

  it('createExpiredResult creates valid expired result', () => {
    const result = createExpiredResult(mockInput, 'alice.unverified.cns', false, '2024-01-01T00:00:00Z', 'demo');
    expect(result.status).toBe('expired');
    expect(result.partyId).toBeNull();
    expect(result.reasonCode).toBe('NAME_EXPIRED');
    expect(result.blocking).toBe(true);
    expect(ResolveResultSchema.parse(result)).toEqual(result);
  });

  it('createUnverifiedResult creates valid unverified result', () => {
    const result = createUnverifiedResult(mockInput, 'alice::1234', 'alice.unverified.cns', null, 'demo');
    expect(result.status).toBe('unverified');
    expect(result.partyId).toBe('alice::1234');
    expect(result.reasonCode).toBe('NAME_UNVERIFIED');
    expect(result.requiresConfirmation).toBe(true);
    expect(result.blocking).toBe(false);
    expect(ResolveResultSchema.parse(result)).toEqual(result);
  });

  it('createChangedResult creates valid changed result', () => {
    const result = createChangedResult(mockInput, 'new::1234', 'old::5678', 'alice.unverified.cns', false, null, 'demo');
    expect(result.status).toBe('changed');
    expect(result.partyId).toBe('new::1234');
    expect(result.previousPartyId).toBe('old::5678');
    expect(result.reasonCode).toBe('PARTY_CHANGED_SINCE_LAST_RESOLUTION');
    expect(result.requiresConfirmation).toBe(true);
    expect(ResolveResultSchema.parse(result)).toEqual(result);
  });

  it('createOkResult creates valid ok result', () => {
    const result = createOkResult(mockInput, 'alice::1234', 'alice.unverified.cns', false, null, 'demo');
    expect(result.status).toBe('ok');
    expect(result.partyId).toBe('alice::1234');
    expect(result.reasonCode).toBe('OK');
    expect(result.requiresConfirmation).toBe(false);
    expect(result.blocking).toBe(false);
    expect(ResolveResultSchema.parse(result)).toEqual(result);
  });
});

describe('Reason Messages', () => {
  it('returns messages for all reason codes', () => {
    expect(getReasonMessage('OK')).toBe('Name resolved successfully');
    expect(getReasonMessage('INVALID_INPUT')).toBe('Invalid name or party ID format');
    expect(getReasonMessage('NAME_NOT_FOUND')).toBe('Name not found');
    expect(getReasonMessage('PARTY_NOT_FOUND')).toBe('Party ID not registered');
    expect(getReasonMessage('NAME_EXPIRED')).toBe('This name has expired');
    expect(getReasonMessage('NAME_UNVERIFIED')).toBe('This name is not identity-verified');
    expect(getReasonMessage('PARTY_CHANGED_SINCE_LAST_RESOLUTION')).toBe('The party ID for this name has changed since last use');
    expect(getReasonMessage('RESOLVER_UNAVAILABLE')).toBe('Unable to connect to resolver service');
  });
});

describe('DemoResolver', () => {
  let resolver: DemoResolver;

  beforeEach(() => {
    resolver = new DemoResolver();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Name resolution', () => {
    it('resolves alice to unverified status', async () => {
      const result = await resolver.resolve('alice');
      expect(result.status).toBe('unverified');
      expect(result.partyId).toBeTruthy();
      expect(result.reasonCode).toBe('NAME_UNVERIFIED');
      expect(result.requiresConfirmation).toBe(true);
      expect(result.blocking).toBe(false);
      validateResolveResult(result);
    });

    it('resolves bank to ok status (verified)', async () => {
      const result = await resolver.resolve('bank');
      expect(result.status).toBe('ok');
      expect(result.partyId).toBeTruthy();
      expect(result.reasonCode).toBe('OK');
      expect(result.verified).toBe(true);
      expect(result.requiresConfirmation).toBe(false);
      validateResolveResult(result);
    });

    it('resolves expired-name to expired status', async () => {
      const result = await resolver.resolve('expired-name');
      expect(result.status).toBe('expired');
      expect(result.partyId).toBeNull();
      expect(result.reasonCode).toBe('NAME_EXPIRED');
      expect(result.blocking).toBe(true);
      validateResolveResult(result);
    });

    it('returns missing for nonexistent name', async () => {
      const result = await resolver.resolve('nonexistent');
      expect(result.status).toBe('missing');
      expect(result.partyId).toBeNull();
      expect(result.reasonCode).toBe('NAME_NOT_FOUND');
      expect(result.blocking).toBe(true);
      validateResolveResult(result);
    });

    it('returns invalid input for bad name format', async () => {
      const result = await resolver.resolve('ab');
      expect(result.status).toBe('missing');
      expect(result.reasonCode).toBe('INVALID_INPUT');
      expect(result.blocking).toBe(true);
      validateResolveResult(result);
    });

    it('detects changed party ID via lastKnown option', async () => {
      const result = await resolver.resolve('alice', {
        knownPartyId: 'old-party::1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      });
      expect(result.status).toBe('changed');
      expect(result.reasonCode).toBe('PARTY_CHANGED_SINCE_LAST_RESOLUTION');
      expect(result.requiresConfirmation).toBe(true);
      expect(result.previousPartyId).toBe('old-party::1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      validateResolveResult(result);
    });
  });

  describe('Party ID resolution', () => {
    it('resolves valid party ID to name', async () => {
      const partyId = 'alice::1220f2fe29866fd6a0009ecc8a64ccdc09f1958bd0f801166baaee469d1251b2eb72';
      const result = await resolver.resolve(partyId);
      expect(result.status).toBe('unverified');
      expect(result.partyId).toBe(partyId);
      expect(result.name).toBe('alice.unverified.cns');
      validateResolveResult(result);
    });

    it('returns not found for unknown party ID', async () => {
      const partyId = 'unknown::1220f2fe29866fd6a0009ecc8a64ccdc09f1958bd0f801166baaee469d1251b2eb72';
      const result = await resolver.resolve(partyId);
      expect(result.status).toBe('missing');
      expect(result.reasonCode).toBe('PARTY_NOT_FOUND');
      validateResolveResult(result);
    });
  });

  describe('Confirmation rules', () => {
    it('requiresConfirmation is true only for unverified and changed', async () => {
      const unverified = await resolver.resolve('alice');
      expect(unverified.requiresConfirmation).toBe(true);
      const ok = await resolver.resolve('bank');
      expect(ok.requiresConfirmation).toBe(false);
      const expired = await resolver.resolve('expired-name');
      expect(expired.requiresConfirmation).toBe(false);
      const missing = await resolver.resolve('nonexistent');
      expect(missing.requiresConfirmation).toBe(false);
    });

    it('blocking is true for missing and expired', async () => {
      const missing = await resolver.resolve('nonexistent');
      expect(missing.blocking).toBe(true);
      const expired = await resolver.resolve('expired-name');
      expect(expired.blocking).toBe(true);
      const unverified = await resolver.resolve('alice');
      expect(unverified.blocking).toBe(false);
      const ok = await resolver.resolve('bank');
      expect(ok.blocking).toBe(false);
    });
  });

  describe('Schema validation', () => {
    it('all demo resolver results pass schema validation', async () => {
      const names = ['alice', 'bob', 'bank', 'expired-name', 'nonexistent', 'ab', 'canton-dev'];
      for (const name of names) {
        const result = await resolver.resolve(name);
        expect(() => validateResolveResult(result)).not.toThrow();
      }
    });
  });

  describe('Verified name resolution', () => {
    it('resolves bank (base name) to verified ok status', async () => {
      const result = await resolver.resolve('bank');
      expect(result.status).toBe('ok');
      expect(result.verified).toBe(true);
      expect(result.name).toBe('bank.cns');
      expect(result.reasonCode).toBe('OK');
      validateResolveResult(result);
    });

    it('resolves bank.cns (full name) to verified ok status', async () => {
      const result = await resolver.resolve('bank.cns');
      expect(result.status).toBe('ok');
      expect(result.verified).toBe(true);
      expect(result.name).toBe('bank.cns');
      expect(result.reasonCode).toBe('OK');
      validateResolveResult(result);
    });

    it('verified names do not have .unverified.cns suffix', () => {
      for (const [key, entry] of Object.entries(DEMO_ENTRIES)) {
        if (entry.verified) {
          expect(entry.name.endsWith(CNS_SUFFIX_UNVERIFIED)).toBe(false);
          expect(key.endsWith(CNS_SUFFIX_UNVERIFIED)).toBe(false);
        }
      }
    });
  });

  describe('Demo entries consistency', () => {
    it('validateDemoEntries returns valid for current demo entries', () => {
      const validation = validateDemoEntries();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('verified entries use .cns suffix, unverified use .unverified.cns suffix', () => {
      for (const [key, entry] of Object.entries(DEMO_ENTRIES)) {
        if (entry.verified) {
          expect(entry.name).toMatch(/\.cns$/);
          expect(entry.name).not.toMatch(/\.unverified\.cns$/);
        } else {
          expect(entry.name).toMatch(/\.unverified\.cns$/);
        }
      }
    });
  });
});

describe('Local Cache', () => {
  const mockStorage: Record<string, string> = {};
  const originalWindow = global.window;

  beforeEach(() => {
    const mockLocalStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
      length: 0,
      key: () => null,
    };
    global.window = { localStorage: mockLocalStorage } as unknown as Window & typeof globalThis;
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  });

  afterEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    global.window = originalWindow;
  });

  it('getCachedLastKnown returns null when no cache', () => {
    const result = getCachedLastKnown('alice.unverified.cns');
    expect(result).toBeNull();
  });

  it('setCachedLastKnown stores and getCachedLastKnown retrieves', () => {
    setCachedLastKnown('alice.unverified.cns', 'party::1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    const result = getCachedLastKnown('alice.unverified.cns');
    expect(result).not.toBeNull();
    expect(result?.partyId).toBe('party::1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    expect(result?.name).toBe('alice.unverified.cns');
  });

  it('clearCachedLastKnown removes cache', () => {
    setCachedLastKnown('alice.unverified.cns', 'party::1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    clearCachedLastKnown('alice.unverified.cns');
    const result = getCachedLastKnown('alice.unverified.cns');
    expect(result).toBeNull();
  });
});
