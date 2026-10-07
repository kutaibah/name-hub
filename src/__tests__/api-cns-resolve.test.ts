import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/cns/resolve/route';

describe('GET /api/cns/resolve', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, NEXT_PUBLIC_CNS_MODE: 'demo' };
  });

  afterEach(() => {
    process.env = env;
    vi.restoreAllMocks();
  });

  it('returns 400 when q is missing', async () => {
    const res = await GET(new Request('http://localhost/api/cns/resolve'));
    expect(res.status).toBe(400);
  });

  it('returns 503 unavailable result when live backend not configured', async () => {
    const res = await GET(new Request('http://localhost/api/cns/resolve?q=alice'));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe('missing');
    expect(body.reasonCode).toBe('RESOLVER_UNAVAILABLE');
  });
});
