import { createMissingResult, parseInput, type ResolveResult } from '@canton-names/resolver';
import { getCnsServerUpstreamConfig } from '@/lib/cns/server-config';
import { getServerLiveResolver } from '@/lib/cns/upstream-client';
import { LastKnownResolutionSchema } from '@canton-names/resolver';

export const runtime = 'nodejs';

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(request: Request): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (rateLimited(ip)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q) {
    return Response.json({ error: 'Missing query parameter: q' }, { status: 400 });
  }

  const upstreamCfg = getCnsServerUpstreamConfig();
  if (!upstreamCfg) {
    const input = parseInput(q);
    const result: ResolveResult = createMissingResult(
      input,
      'RESOLVER_UNAVAILABLE',
      'live',
      input.kind === 'name' ? input.normalized : undefined
    );
    return Response.json(result, { status: 503 });
  }

  const resolver = getServerLiveResolver();
  if (!resolver) {
    return Response.json({ error: 'Resolver not configured' }, { status: 503 });
  }

  const knownPartyId = url.searchParams.get('knownPartyId') ?? undefined;
  const lastKnownRaw = url.searchParams.get('lastKnown');
  let lastKnown;
  if (lastKnownRaw) {
    try {
      const parsed = LastKnownResolutionSchema.safeParse(JSON.parse(lastKnownRaw));
      if (parsed.success) lastKnown = parsed.data;
    } catch {
      // ignore
    }
  }

  const result = await resolver.resolve(q, { knownPartyId, lastKnown });
  return Response.json(result);
}
