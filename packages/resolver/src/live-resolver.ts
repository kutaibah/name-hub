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
  CNS_SUFFIX_UNVERIFIED,
} from './resolve-contract';
import { LookupEntryByNameResponseSchema } from './scan-types';

export class LiveResolver implements Resolver {
  private baseUrl: string;

  constructor(scanApiUrl: string) {
    this.baseUrl = scanApiUrl;
  }

  async resolve(inputStr: string, opts?: ResolveOptions): Promise<ResolveResult> {
    const input = parseInput(inputStr);
    const source = 'live' as const;

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

      if (expiresAt && new Date(expiresAt) < new Date()) {
        return createExpiredResult(input, entry.name, verified, expiresAt, source);
      }

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

      setCachedLastKnown(input.normalized, partyId);

      if (verified) {
        return createOkResult(input, partyId, entry.name, true, expiresAt, source);
      }

      return createUnverifiedResult(input, partyId, entry.name, expiresAt, source);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      return this.createUnavailableResult(input);
    }
  }

  private createUnavailableResult(input: ResolveInput): MissingResult {
    return createMissingResult(
      input,
      'RESOLVER_UNAVAILABLE',
      'live',
      input.kind === 'name' ? input.normalized : undefined
    );
  }
}
