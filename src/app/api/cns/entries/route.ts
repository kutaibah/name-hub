import { getCnsServerUpstreamConfig } from '@/lib/cns/server-config';
import { getServerLiveResolver } from '@/lib/cns/upstream-client';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const upstreamCfg = getCnsServerUpstreamConfig();
  if (!upstreamCfg) {
    return Response.json({ error: 'Live CNS backend not configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const byName = url.searchParams.get('name');
  const byParty = url.searchParams.get('party');
  const prefix = url.searchParams.get('prefix');
  const limit = Number(url.searchParams.get('limit') ?? '10');

  const resolver = getServerLiveResolver();
  if (!resolver) {
    return Response.json({ error: 'Resolver not configured' }, { status: 503 });
  }

  const client = resolver.getScanClient();

  if (byName) {
    const result = await client.lookupByName(byName);
    if (result === 'not_found') return Response.json({ entry: null });
    if (result === 'error') return Response.json({ error: 'Upstream error' }, { status: 502 });
    return Response.json({ entry: result.entry });
  }

  if (byParty) {
    const result = await client.lookupByParty(byParty);
    if (result === 'not_found') return Response.json({ entry: null });
    if (result === 'error') return Response.json({ error: 'Upstream error' }, { status: 502 });
    return Response.json({ entry: result.entry });
  }

  if (prefix) {
    if (prefix.length < 2) {
      return Response.json({ entries: [] });
    }
    const result = await client.searchByPrefix(prefix, Math.min(Math.max(limit, 1), 50));
    if (result === 'error') return Response.json({ error: 'Upstream error' }, { status: 502 });
    return Response.json({ entries: result });
  }

  return Response.json({ error: 'Provide name, party, or prefix query parameter' }, { status: 400 });
}
