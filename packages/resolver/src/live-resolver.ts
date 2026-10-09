import type { Resolver, ResolveOptions, ResolveResult } from './resolve-contract';
import {
  parseInput,
  validateCnsName,
  validatePartyId,
  createMissingResult,
} from './resolve-contract';
import { ScanAnsClient, type ScanAnsClientOptions } from './scan-ans-client';
import { alternateVerifiedName, mapNameLookupToResult, mapPartyLookupToResult } from './map-live-entry';
import { configureAnsAcronym } from './ans-suffix';

export type LiveResolverOptions = ScanAnsClientOptions & {
  ansAcronym?: string;
};

export class LiveResolver implements Resolver {
  private client: ScanAnsClient;
  private ansAcronym?: string;

  /** @param scanApiUrl Legacy: Scan API base URL with `scan` style and no auth */
  constructor(scanApiUrlOrOptions: string | LiveResolverOptions) {
    if (typeof scanApiUrlOrOptions === 'string') {
      this.client = new ScanAnsClient({
        baseUrl: scanApiUrlOrOptions,
        style: 'scan',
      });
    } else {
      const { ansAcronym, ...clientOpts } = scanApiUrlOrOptions;
      this.ansAcronym = ansAcronym;
      if (ansAcronym) {
        configureAnsAcronym(ansAcronym);
      }
      this.client = new ScanAnsClient(clientOpts);
    }
  }

  async resolve(inputStr: string, opts?: ResolveOptions): Promise<ResolveResult> {
    if (this.ansAcronym) {
      configureAnsAcronym(this.ansAcronym);
    }

    const input = parseInput(inputStr);

    if (input.kind === 'partyId') {
      const validation = validatePartyId(input.raw);
      if (!validation.valid) {
        return createMissingResult(input, 'INVALID_INPUT', 'live');
      }

      const lookup = await this.client.lookupByParty(input.normalized, opts?.signal);
      return mapPartyLookupToResult(input, lookup);
    }

    const validation = validateCnsName(input.raw);
    if (!validation.valid) {
      return createMissingResult(input, 'INVALID_INPUT', 'live', input.normalized);
    }

    let lookup = await this.client.lookupByName(input.normalized, opts?.signal);

    if (lookup === 'not_found') {
      const alt = alternateVerifiedName(input.normalized);
      if (alt) {
        lookup = await this.client.lookupByName(alt, opts?.signal);
      }
    }

    return mapNameLookupToResult(input, lookup, opts);
  }

  /** Expose low-level ANS reads for app adapters (search, availability). */
  getScanClient(): ScanAnsClient {
    return this.client;
  }
}
