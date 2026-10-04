import { z } from 'zod';

/**
 * Reason codes for resolution outcomes.
 * These are stable, machine-readable codes for programmatic handling.
 */
export const ReasonCode = {
  OK: 'OK',
  INVALID_INPUT: 'INVALID_INPUT',
  NAME_NOT_FOUND: 'NAME_NOT_FOUND',
  PARTY_NOT_FOUND: 'PARTY_NOT_FOUND',
  NAME_EXPIRED: 'NAME_EXPIRED',
  NAME_UNVERIFIED: 'NAME_UNVERIFIED',
  PARTY_CHANGED_SINCE_LAST_RESOLUTION: 'PARTY_CHANGED_SINCE_LAST_RESOLUTION',
  RESOLVER_UNAVAILABLE: 'RESOLVER_UNAVAILABLE',
} as const;

export type ReasonCode = (typeof ReasonCode)[keyof typeof ReasonCode];

export const ReasonCodeSchema = z.enum([
  'OK',
  'INVALID_INPUT',
  'NAME_NOT_FOUND',
  'PARTY_NOT_FOUND',
  'NAME_EXPIRED',
  'NAME_UNVERIFIED',
  'PARTY_CHANGED_SINCE_LAST_RESOLUTION',
  'RESOLVER_UNAVAILABLE',
]);

/**
 * Resolution status values.
 * - ok: Name resolved successfully, party ID is safe to use
 * - missing: Name or party not found
 * - expired: Name exists but has expired
 * - unverified: Name exists but is not identity-verified (requires confirmation)
 * - changed: Party ID differs from last known resolution (requires confirmation)
 */
export const ResolveStatus = {
  OK: 'ok',
  MISSING: 'missing',
  EXPIRED: 'expired',
  UNVERIFIED: 'unverified',
  CHANGED: 'changed',
} as const;

export type ResolveStatus = (typeof ResolveStatus)[keyof typeof ResolveStatus];

export const ResolveStatusSchema = z.enum(['ok', 'missing', 'expired', 'unverified', 'changed']);

/**
 * Input kind detection.
 */
export const InputKind = {
  NAME: 'name',
  PARTY_ID: 'partyId',
} as const;

export type InputKind = (typeof InputKind)[keyof typeof InputKind];

export const InputKindSchema = z.enum(['name', 'partyId']);

/**
 * Parsed and normalized input.
 */
export const ResolveInputSchema = z.object({
  raw: z.string(),
  normalized: z.string(),
  kind: InputKindSchema,
});

export type ResolveInput = z.infer<typeof ResolveInputSchema>;

/**
 * Last known resolution for change detection.
 */
export const LastKnownResolutionSchema = z.object({
  name: z.string(),
  partyId: z.string(),
  resolvedAt: z.string().datetime(),
});

export type LastKnownResolution = z.infer<typeof LastKnownResolutionSchema>;

/**
 * Base fields present in all ResolveResult variants.
 */
const BaseResolveResultSchema = z.object({
  input: ResolveInputSchema,
  resolvedAt: z.string().datetime(),
  source: z.enum(['demo', 'live']),
});

/**
 * OK result: name resolved successfully, safe to use.
 */
export const OkResultSchema = BaseResolveResultSchema.extend({
  status: z.literal('ok'),
  partyId: z.string(),
  reasonCode: z.literal('OK'),
  requiresConfirmation: z.literal(false),
  blocking: z.literal(false),
  name: z.string(),
  verified: z.boolean(),
  expiresAt: z.string().datetime().nullable(),
  previousPartyId: z.null(),
});

/**
 * Missing result: name or party not found, or resolver unavailable.
 */
export const MissingResultSchema = BaseResolveResultSchema.extend({
  status: z.literal('missing'),
  partyId: z.null(),
  reasonCode: z.enum(['INVALID_INPUT', 'NAME_NOT_FOUND', 'PARTY_NOT_FOUND', 'RESOLVER_UNAVAILABLE']),
  requiresConfirmation: z.literal(false),
  blocking: z.literal(true),
  name: z.string().nullable(),
  verified: z.literal(false),
  expiresAt: z.null(),
  previousPartyId: z.null(),
});

/**
 * Expired result: name exists but has expired.
 */
export const ExpiredResultSchema = BaseResolveResultSchema.extend({
  status: z.literal('expired'),
  partyId: z.null(),
  reasonCode: z.literal('NAME_EXPIRED'),
  requiresConfirmation: z.literal(false),
  blocking: z.literal(true),
  name: z.string(),
  verified: z.boolean(),
  expiresAt: z.string().datetime(),
  previousPartyId: z.null(),
});

/**
 * Unverified result: name exists but is not identity-verified.
 * Requires user confirmation before use.
 */
export const UnverifiedResultSchema = BaseResolveResultSchema.extend({
  status: z.literal('unverified'),
  partyId: z.string(),
  reasonCode: z.literal('NAME_UNVERIFIED'),
  requiresConfirmation: z.literal(true),
  blocking: z.literal(false),
  name: z.string(),
  verified: z.literal(false),
  expiresAt: z.string().datetime().nullable(),
  previousPartyId: z.null(),
});

/**
 * Changed result: party ID differs from last known resolution.
 * Requires user confirmation before use.
 */
export const ChangedResultSchema = BaseResolveResultSchema.extend({
  status: z.literal('changed'),
  partyId: z.string(),
  reasonCode: z.literal('PARTY_CHANGED_SINCE_LAST_RESOLUTION'),
  requiresConfirmation: z.literal(true),
  blocking: z.literal(false),
  name: z.string(),
  verified: z.boolean(),
  expiresAt: z.string().datetime().nullable(),
  previousPartyId: z.string(),
});

/**
 * Discriminated union of all resolve result types.
 */
export const ResolveResultSchema = z.discriminatedUnion('status', [
  OkResultSchema,
  MissingResultSchema,
  ExpiredResultSchema,
  UnverifiedResultSchema,
  ChangedResultSchema,
]);

export type ResolveResult = z.infer<typeof ResolveResultSchema>;
export type OkResult = z.infer<typeof OkResultSchema>;
export type MissingResult = z.infer<typeof MissingResultSchema>;
export type ExpiredResult = z.infer<typeof ExpiredResultSchema>;
export type UnverifiedResult = z.infer<typeof UnverifiedResultSchema>;
export type ChangedResult = z.infer<typeof ChangedResultSchema>;

/**
 * Options for the resolve function.
 */
export interface ResolveOptions {
  knownPartyId?: string;
  lastKnown?: LastKnownResolution;
  signal?: AbortSignal;
}

/**
 * Resolver interface that both demo and live implementations must satisfy.
 */
export interface Resolver {
  resolve(input: string, opts?: ResolveOptions): Promise<ResolveResult>;
}

/**
 * CNS name suffix for unverified names.
 */
export const CNS_SUFFIX_UNVERIFIED = '.unverified.cns';

/**
 * CNS name suffix for verified names.
 */
export const CNS_SUFFIX_VERIFIED = '.cns';

/**
 * @deprecated Use CNS_SUFFIX_UNVERIFIED instead
 */
export const CNS_SUFFIX = CNS_SUFFIX_UNVERIFIED;

/**
 * Pattern for valid CNS names (without suffix).
 */
const NAME_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/**
 * Pattern for Canton party IDs.
 * Format: identifier::hex (where hex is the party ID hash)
 */
const PARTY_ID_PATTERN = /^[a-zA-Z0-9_-]+::[a-fA-F0-9]{64,}$/;

/**
 * Detects whether input is a CNS name or a party ID.
 */
export function detectInputKind(input: string): InputKind {
  const trimmed = input.trim();
  if (PARTY_ID_PATTERN.test(trimmed)) {
    return 'partyId';
  }
  return 'name';
}

/**
 * Normalizes input based on its kind.
 * - Names: lowercase, trim, ensure suffix
 *   - If already has .cns or .unverified.cns suffix, keep it
 *   - Otherwise, append .unverified.cns (default lookup)
 * - Party IDs: trim only (case-sensitive)
 */
export function normalizeInput(input: string, kind: InputKind): string {
  const trimmed = input.trim();
  if (kind === 'partyId') {
    return trimmed;
  }
  let normalized = trimmed.toLowerCase();
  // If already has a .cns suffix (verified or unverified), keep it
  if (normalized.endsWith(CNS_SUFFIX_VERIFIED)) {
    return normalized;
  }
  // Otherwise, default to unverified suffix for lookup
  normalized = `${normalized}${CNS_SUFFIX_UNVERIFIED}`;
  return normalized;
}

/**
 * Parses and validates input, returning structured input info.
 */
export function parseInput(raw: string): ResolveInput {
  const kind = detectInputKind(raw);
  const normalized = normalizeInput(raw, kind);
  return { raw, normalized, kind };
}

/**
 * Validates a CNS name (without suffix).
 */
export function validateCnsName(name: string): { valid: true } | { valid: false; reason: string } {
  let baseName = name.trim().toLowerCase();
  // Strip both verified and unverified suffixes (check unverified first as it's longer)
  if (baseName.endsWith(CNS_SUFFIX_UNVERIFIED)) {
    baseName = baseName.slice(0, -CNS_SUFFIX_UNVERIFIED.length);
  } else if (baseName.endsWith(CNS_SUFFIX_VERIFIED)) {
    baseName = baseName.slice(0, -CNS_SUFFIX_VERIFIED.length);
  }

  if (baseName.length < 3) {
    return { valid: false, reason: 'Name must be at least 3 characters' };
  }

  if (baseName.length > 63) {
    return { valid: false, reason: 'Name must be at most 63 characters' };
  }

  if (!NAME_PATTERN.test(baseName)) {
    return { valid: false, reason: 'Name can only contain lowercase letters, numbers, and hyphens (not at start or end)' };
  }

  return { valid: true };
}

/**
 * Validates a party ID format.
 */
export function validatePartyId(partyId: string): { valid: true } | { valid: false; reason: string } {
  const trimmed = partyId.trim();
  if (!PARTY_ID_PATTERN.test(trimmed)) {
    return { valid: false, reason: 'Invalid party ID format' };
  }
  return { valid: true };
}

/**
 * Creates the current ISO timestamp.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Helper to create a missing result.
 */
export function createMissingResult(
  input: ResolveInput,
  reasonCode: 'INVALID_INPUT' | 'NAME_NOT_FOUND' | 'PARTY_NOT_FOUND' | 'RESOLVER_UNAVAILABLE',
  source: 'demo' | 'live',
  name?: string
): MissingResult {
  return {
    status: 'missing',
    partyId: null,
    reasonCode,
    requiresConfirmation: false,
    blocking: true,
    input,
    name: name ?? null,
    verified: false,
    expiresAt: null,
    previousPartyId: null,
    resolvedAt: nowISO(),
    source,
  };
}

/**
 * Helper to create an expired result.
 */
export function createExpiredResult(
  input: ResolveInput,
  name: string,
  verified: boolean,
  expiresAt: string,
  source: 'demo' | 'live'
): ExpiredResult {
  return {
    status: 'expired',
    partyId: null,
    reasonCode: 'NAME_EXPIRED',
    requiresConfirmation: false,
    blocking: true,
    input,
    name,
    verified,
    expiresAt,
    previousPartyId: null,
    resolvedAt: nowISO(),
    source,
  };
}

/**
 * Helper to create an unverified result.
 */
export function createUnverifiedResult(
  input: ResolveInput,
  partyId: string,
  name: string,
  expiresAt: string | null,
  source: 'demo' | 'live'
): UnverifiedResult {
  return {
    status: 'unverified',
    partyId,
    reasonCode: 'NAME_UNVERIFIED',
    requiresConfirmation: true,
    blocking: false,
    input,
    name,
    verified: false,
    expiresAt,
    previousPartyId: null,
    resolvedAt: nowISO(),
    source,
  };
}

/**
 * Helper to create a changed result.
 */
export function createChangedResult(
  input: ResolveInput,
  partyId: string,
  previousPartyId: string,
  name: string,
  verified: boolean,
  expiresAt: string | null,
  source: 'demo' | 'live'
): ChangedResult {
  return {
    status: 'changed',
    partyId,
    reasonCode: 'PARTY_CHANGED_SINCE_LAST_RESOLUTION',
    requiresConfirmation: true,
    blocking: false,
    input,
    name,
    verified,
    expiresAt,
    previousPartyId,
    resolvedAt: nowISO(),
    source,
  };
}

/**
 * Helper to create an OK result.
 */
export function createOkResult(
  input: ResolveInput,
  partyId: string,
  name: string,
  verified: boolean,
  expiresAt: string | null,
  source: 'demo' | 'live'
): OkResult {
  return {
    status: 'ok',
    partyId,
    reasonCode: 'OK',
    requiresConfirmation: false,
    blocking: false,
    input,
    name,
    verified,
    expiresAt,
    previousPartyId: null,
    resolvedAt: nowISO(),
    source,
  };
}

/**
 * Human-readable messages for each reason code.
 */
export const REASON_MESSAGES: Record<ReasonCode, string> = {
  OK: 'Name resolved successfully',
  INVALID_INPUT: 'Invalid name or party ID format',
  NAME_NOT_FOUND: 'Name not found',
  PARTY_NOT_FOUND: 'Party ID not registered',
  NAME_EXPIRED: 'This name has expired',
  NAME_UNVERIFIED: 'This name is not identity-verified',
  PARTY_CHANGED_SINCE_LAST_RESOLUTION: 'The party ID for this name has changed since last use',
  RESOLVER_UNAVAILABLE: 'Unable to connect to resolver service',
};

/**
 * Get human-readable message for a reason code.
 */
export function getReasonMessage(code: ReasonCode): string {
  return REASON_MESSAGES[code];
}

/**
 * Local storage key prefix for last-known cache.
 */
const LAST_KNOWN_CACHE_PREFIX = 'cns:lastKnown:';

/**
 * Get localStorage safely (handles SSR and test environments).
 */
function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // localStorage may throw in some environments
  }
  return null;
}

/**
 * Get cached last-known resolution for a name.
 */
export function getCachedLastKnown(normalizedName: string): LastKnownResolution | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const cached = storage.getItem(`${LAST_KNOWN_CACHE_PREFIX}${normalizedName}`);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    const validated = LastKnownResolutionSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

/**
 * Cache a resolution as last-known for a name.
 */
export function setCachedLastKnown(normalizedName: string, partyId: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const entry: LastKnownResolution = {
      name: normalizedName,
      partyId,
      resolvedAt: nowISO(),
    };
    storage.setItem(`${LAST_KNOWN_CACHE_PREFIX}${normalizedName}`, JSON.stringify(entry));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear cached last-known for a name.
 */
export function clearCachedLastKnown(normalizedName: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(`${LAST_KNOWN_CACHE_PREFIX}${normalizedName}`);
  } catch {
    // Ignore storage errors
  }
}
