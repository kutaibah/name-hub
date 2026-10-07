import type { ResolveInput, ResolveOptions, ResolveResult } from './resolve-contract';
import {
  createMissingResult,
  createExpiredResult,
  createUnverifiedResult,
  createChangedResult,
  createOkResult,
  getCachedLastKnown,
  setCachedLastKnown,
} from './resolve-contract';
import type { AnsEntry } from './scan-types';
import { getUnverifiedSuffix, getVerifiedSuffix, isDsoOrSvStyleEntry, nameEndsWithUnverifiedSuffix } from './ans-suffix';

export function alternateVerifiedName(normalizedUnverified: string): string | null {
  const unverified = getUnverifiedSuffix();
  if (!normalizedUnverified.endsWith(unverified)) return null;
  const base = normalizedUnverified.slice(0, -unverified.length);
  return `${base}${getVerifiedSuffix()}`;
}

function entryIsExpired(expiresAt: string | null | undefined): boolean {
  return Boolean(expiresAt && new Date(expiresAt) < new Date());
}

function cacheShowsExpired(normalizedName: string, opts?: ResolveOptions): boolean {
  const lastKnown = opts?.lastKnown ?? getCachedLastKnown(normalizedName);
  if (!lastKnown?.expiresAt) return false;
  return new Date(lastKnown.expiresAt) < new Date();
}

export function mapNameLookupToResult(
  input: ResolveInput,
  lookup: { entry: AnsEntry } | 'not_found' | 'error',
  opts?: ResolveOptions
): ResolveResult {
  const source = 'live' as const;

  if (lookup === 'error') {
    return createMissingResult(input, 'RESOLVER_UNAVAILABLE', source, input.normalized);
  }

  if (lookup === 'not_found') {
    if (cacheShowsExpired(input.normalized, opts)) {
      const lastKnown = opts?.lastKnown ?? getCachedLastKnown(input.normalized);
      const verified = lastKnown ? !nameEndsWithUnverifiedSuffix(lastKnown.name) : false;
      return createExpiredResult(
        input,
        lastKnown!.name,
        verified,
        lastKnown!.expiresAt!,
        source
      );
    }
    return createMissingResult(input, 'NAME_NOT_FOUND', source, input.normalized);
  }

  const entry = lookup.entry;
  const partyId = entry.user;
  const expiresAt = entry.expires_at ?? null;
  const dsoStyle = isDsoOrSvStyleEntry(entry);
  const verifiedBySuffix = !nameEndsWithUnverifiedSuffix(entry.name);

  if (entryIsExpired(expiresAt)) {
    return createExpiredResult(input, entry.name, dsoStyle || verifiedBySuffix, expiresAt!, source);
  }

  const lastKnown = opts?.lastKnown ?? getCachedLastKnown(input.normalized);
  const knownPartyId = opts?.knownPartyId ?? lastKnown?.partyId;

  if (knownPartyId && knownPartyId !== partyId) {
    return createChangedResult(
      input,
      partyId,
      knownPartyId,
      entry.name,
      dsoStyle || verifiedBySuffix,
      expiresAt,
      source
    );
  }

  setCachedLastKnown(input.normalized, partyId, expiresAt);

  if (dsoStyle || verifiedBySuffix) {
    return createOkResult(input, partyId, entry.name, true, expiresAt, source);
  }

  if (knownPartyId && knownPartyId === partyId) {
    return createOkResult(input, partyId, entry.name, false, expiresAt, source);
  }

  return createUnverifiedResult(input, partyId, entry.name, expiresAt, source);
}

export function mapPartyLookupToResult(
  input: ResolveInput,
  lookup: { entry: AnsEntry } | 'not_found' | 'error'
): ResolveResult {
  const source = 'live' as const;

  if (lookup === 'error') {
    return createMissingResult(input, 'RESOLVER_UNAVAILABLE', source);
  }

  if (lookup === 'not_found') {
    return createMissingResult(input, 'PARTY_NOT_FOUND', source);
  }

  const entry = lookup.entry;
  const partyId = entry.user;
  const expiresAt = entry.expires_at ?? null;
  const dsoStyle = isDsoOrSvStyleEntry(entry);
  const verifiedBySuffix = !nameEndsWithUnverifiedSuffix(entry.name);

  if (entryIsExpired(expiresAt)) {
    return createExpiredResult(input, entry.name, dsoStyle || verifiedBySuffix, expiresAt!, source);
  }

  if (dsoStyle || verifiedBySuffix) {
    return createOkResult(input, partyId, entry.name, true, expiresAt, source);
  }

  return createUnverifiedResult(input, partyId, entry.name, expiresAt, source);
}
