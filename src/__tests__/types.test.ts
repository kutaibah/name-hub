import { describe, it, expect } from 'vitest';
import { 
  validateName, 
  parseCanonicalName, 
  formatPartyId, 
  isExpired,
  CNS_SUFFIX,
  NAME_VALIDATION,
} from '@/lib/cns/types';

describe('validateName', () => {
  it('accepts valid names', () => {
    const result = validateName('alice');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.canonicalName).toBe('alice.unverified.cns');
    }
  });

  it('accepts names with numbers', () => {
    const result = validateName('user123');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.canonicalName).toBe('user123.unverified.cns');
    }
  });

  it('accepts names with hyphens', () => {
    const result = validateName('my-name');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.canonicalName).toBe('my-name.unverified.cns');
    }
  });

  it('normalizes uppercase to lowercase', () => {
    const result = validateName('ALICE');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.canonicalName).toBe('alice.unverified.cns');
    }
  });

  it('handles names already with suffix', () => {
    const result = validateName('alice.unverified.cns');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.canonicalName).toBe('alice.unverified.cns');
    }
  });

  it('rejects names that are too short', () => {
    const result = validateName('ab');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('at least');
    }
  });

  it('rejects names that are too long', () => {
    const longName = 'a'.repeat(NAME_VALIDATION.MAX_LENGTH + 1);
    const result = validateName(longName);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('at most');
    }
  });

  it('rejects names starting with hyphen', () => {
    const result = validateName('-invalid');
    expect(result.valid).toBe(false);
  });

  it('rejects names ending with hyphen', () => {
    const result = validateName('invalid-');
    expect(result.valid).toBe(false);
  });

  it('rejects names with special characters', () => {
    const result = validateName('alice!@#');
    expect(result.valid).toBe(false);
  });

  it('rejects reserved names', () => {
    for (const reserved of NAME_VALIDATION.RESERVED) {
      const result = validateName(reserved);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.reason).toContain('reserved');
      }
    }
  });
});

describe('parseCanonicalName', () => {
  it('strips suffix from canonical name', () => {
    expect(parseCanonicalName('alice.unverified.cns')).toBe('alice');
  });

  it('returns name unchanged if no suffix', () => {
    expect(parseCanonicalName('alice')).toBe('alice');
  });
});

describe('formatPartyId', () => {
  const longPartyId = 'auth0_007c675a429eaf831f0991308d85::12201abe669f1234567890abcdef';

  it('returns full party ID when short=false', () => {
    expect(formatPartyId(longPartyId, false)).toBe(longPartyId);
  });

  it('truncates long party ID when short=true', () => {
    const result = formatPartyId(longPartyId, true);
    expect(result).toContain('...');
    expect(result.length).toBeLessThan(longPartyId.length);
  });

  it('returns short party ID unchanged when short=true', () => {
    const shortId = 'short';
    expect(formatPartyId(shortId, true)).toBe(shortId);
  });
});

describe('isExpired', () => {
  it('returns false for null/undefined', () => {
    expect(isExpired(null)).toBe(false);
    expect(isExpired(undefined)).toBe(false);
  });

  it('returns true for past dates', () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    expect(isExpired(pastDate.toISOString())).toBe(true);
  });

  it('returns false for future dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(isExpired(futureDate.toISOString())).toBe(false);
  });
});

describe('CNS_SUFFIX', () => {
  it('is the expected value', () => {
    expect(CNS_SUFFIX).toBe('.unverified.cns');
  });
});
