import type { ResolveOptions, ResolveResult } from './resolve-contract';
import { LastKnownResolutionSchema } from './resolve-contract';
import { LiveResolver, type LiveResolverOptions } from './live-resolver';

export interface CreateResolveHandlerOptions extends LiveResolverOptions {
  /** Optional in-memory cache TTL in milliseconds (default 15_000). */
  cacheTtlMs?: number;
}

type CacheEntry = { result: ResolveResult; expiresAt: number };

const defaultCache = new Map<string, CacheEntry>();

function cacheKey(q: string, knownPartyId?: string): string {
  return `${q}\0${knownPartyId ?? ''}`;
}

export function createResolveHandler(options: CreateResolveHandlerOptions) {
  const resolver = new LiveResolver(options);
  const ttl = options.cacheTtlMs ?? 15_000;

  return async function handleResolveRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    if (!q) {
      return Response.json({ error: 'Missing query parameter: q' }, { status: 400 });
    }

    const knownPartyId = url.searchParams.get('knownPartyId') ?? undefined;
    const lastKnownRaw = url.searchParams.get('lastKnown');
    let lastKnown: ResolveOptions['lastKnown'];
    if (lastKnownRaw) {
      try {
        const parsed = LastKnownResolutionSchema.safeParse(JSON.parse(lastKnownRaw));
        if (parsed.success) lastKnown = parsed.data;
      } catch {
        // ignore invalid lastKnown
      }
    }

    const key = cacheKey(q, knownPartyId);
    const now = Date.now();
    const cached = defaultCache.get(key);
    if (cached && cached.expiresAt > now) {
      return Response.json(cached.result);
    }

    const result = await resolver.resolve(q, { knownPartyId, lastKnown });
    defaultCache.set(key, { result, expiresAt: now + ttl });
    return Response.json(result);
  };
}

export { ScanAnsClient, buildAnsEntriesBasePath, type UpstreamStyle } from './scan-ans-client';
export { LiveResolver, type LiveResolverOptions } from './live-resolver';
