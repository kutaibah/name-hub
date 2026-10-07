import type { Resolver, ResolveOptions, ResolveResult, ResolveInput } from './resolve-contract';
import { parseInput, createMissingResult, ResolveResultSchema } from './resolve-contract';

export interface HttpEndpointResolverOptions {
  endpointUrl: string;
  fetchImpl?: typeof fetch;
}

/**
 * Browser-safe live resolver: calls the integrator's same-origin API route.
 */
export class HttpEndpointResolver implements Resolver {
  private endpointUrl: string;
  private fetchImpl: typeof fetch;

  constructor(endpointUrl: string = '/api/cns/resolve', fetchImpl?: typeof fetch) {
    this.endpointUrl = endpointUrl;
    this.fetchImpl = fetchImpl ?? fetch;
  }

  async resolve(inputStr: string, opts?: ResolveOptions): Promise<ResolveResult> {
    const input = parseInput(inputStr);
    const params = new URLSearchParams({ q: inputStr });
    if (opts?.knownPartyId) {
      params.set('knownPartyId', opts.knownPartyId);
    }
    if (opts?.lastKnown) {
      params.set('lastKnown', JSON.stringify(opts.lastKnown));
    }

    try {
      const response = await this.fetchImpl(`${this.endpointUrl}?${params}`, {
        signal: opts?.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return this.unavailable(input);
      }

      const data = await response.json();
      const parsed = ResolveResultSchema.safeParse(data);
      if (!parsed.success) {
        return this.unavailable(input);
      }
      return parsed.data;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      return this.unavailable(input);
    }
  }

  private unavailable(input: ResolveInput): ResolveResult {
    return createMissingResult(
      input,
      'RESOLVER_UNAVAILABLE',
      'live',
      input.kind === 'name' ? input.normalized : undefined
    );
  }
}
