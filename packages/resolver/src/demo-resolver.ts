import type { Resolver, ResolveOptions, ResolveResult } from './resolve-contract';
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
  CNS_SUFFIX_UNVERIFIED,
  CNS_SUFFIX_VERIFIED,
} from './resolve-contract';
import {
  CHANGED_PARTY_OLD_ID,
  DEMO_ENTRIES,
  DEMO_PARTY_TO_NAME,
} from './demo-entries';

async function demoDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 100));
}

export class DemoResolver implements Resolver {
  async resolve(inputStr: string, opts?: ResolveOptions): Promise<ResolveResult> {
    await demoDelay();

    if (opts?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const input = parseInput(inputStr);
    const source = 'demo' as const;

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

      if (entry.verified) {
        return createOkResult(input, entry.partyId, entry.name, true, entry.expiresAt, source);
      }
      return createUnverifiedResult(input, entry.partyId, entry.name, entry.expiresAt, source);
    }

    const validation = validateCnsName(input.raw);
    if (!validation.valid) {
      return createMissingResult(input, 'INVALID_INPUT', source, input.normalized);
    }

    let entry = DEMO_ENTRIES[input.normalized];
    let resolvedName = input.normalized;

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

    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      return createExpiredResult(input, entry.name, entry.verified, entry.expiresAt, source);
    }

    const lastKnown = opts?.lastKnown ?? getCachedLastKnown(resolvedName);
    const knownPartyId = opts?.knownPartyId ?? lastKnown?.partyId;

    if (resolvedName === 'changed-party.unverified.cns' && !knownPartyId) {
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

    setCachedLastKnown(resolvedName, entry.partyId);

    if (entry.verified) {
      return createOkResult(input, entry.partyId, entry.name, true, entry.expiresAt, source);
    }

    return createUnverifiedResult(input, entry.partyId, entry.name, entry.expiresAt, source);
  }
}
