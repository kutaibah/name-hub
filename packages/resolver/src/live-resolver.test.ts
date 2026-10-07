import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LiveResolver } from './live-resolver';
import { configureAnsAcronym } from './ans-suffix';
import {
  LOCALNET_UNVERIFIED_ENTRY,
  DEVNET_DSO_ENTRY,
  EXPIRED_ENTRY,
} from './fixtures/splice-ans-fixtures';

const SCAN_BASE = 'http://scan.test/api/scan';

function mockFetch(handlers: Record<string, () => Response>) {
  return vi.fn(async (url: string) => {
    const path = url.replace(SCAN_BASE, '');
    for (const [key, handler] of Object.entries(handlers)) {
      if (path.includes(key)) return handler();
    }
    return new Response('not found', { status: 404 });
  }) as typeof fetch;
}

describe('LiveResolver', () => {
  beforeEach(() => {
    configureAnsAcronym('ans');
  });

  it('maps unverified LocalNet name to unverified status', async () => {
    const fetchImpl = mockFetch({
      'by-name/hackalice.unverified.ans': () =>
        new Response(JSON.stringify({ entry: LOCALNET_UNVERIFIED_ENTRY }), { status: 200 }),
    });

    const resolver = new LiveResolver({
      baseUrl: SCAN_BASE,
      style: 'scan',
      ansAcronym: 'ans',
      fetchImpl,
    });

    const result = await resolver.resolve('hackalice');
    expect(result.status).toBe('unverified');
    expect(result.reasonCode).toBe('NAME_UNVERIFIED');
    if (result.status === 'unverified') {
      expect(result.partyId).toBe(LOCALNET_UNVERIFIED_ENTRY.user);
    }
  });

  it('maps DSO-style entry to ok on cns network', async () => {
    configureAnsAcronym('cns');
    const fetchImpl = mockFetch({
      'by-name/dso.cns': () =>
        new Response(JSON.stringify({ entry: DEVNET_DSO_ENTRY }), { status: 200 }),
    });

    const resolver = new LiveResolver({
      baseUrl: SCAN_BASE,
      style: 'scan',
      ansAcronym: 'cns',
      fetchImpl,
    });

    const result = await resolver.resolve('dso.cns');
    expect(result.status).toBe('ok');
    expect(result.reasonCode).toBe('OK');
  });

  it('maps expired entry to expired', async () => {
    const fetchImpl = mockFetch({
      'by-name/expired.unverified.ans': () =>
        new Response(JSON.stringify({ entry: EXPIRED_ENTRY }), { status: 200 }),
    });

    const resolver = new LiveResolver({
      baseUrl: SCAN_BASE,
      style: 'scan',
      ansAcronym: 'ans',
      fetchImpl,
    });

    const result = await resolver.resolve('expired.unverified.ans');
    expect(result.status).toBe('expired');
    expect(result.reasonCode).toBe('NAME_EXPIRED');
  });

  it('uses scan-proxy path prefix', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ entry: LOCALNET_UNVERIFIED_ENTRY }), { status: 200 })
    );

    const resolver = new LiveResolver({
      baseUrl: 'http://validator.test/api/validator',
      style: 'scan-proxy',
      ansAcronym: 'ans',
      fetchImpl,
    });

    await resolver.resolve('hackalice');
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('/v0/scan-proxy/ans-entries/by-name/'),
      expect.any(Object)
    );
  });

  it('returns changed when knownPartyId differs', async () => {
    const fetchImpl = mockFetch({
      'by-name/hackalice.unverified.ans': () =>
        new Response(JSON.stringify({ entry: LOCALNET_UNVERIFIED_ENTRY }), { status: 200 }),
    });

    const resolver = new LiveResolver({
      baseUrl: SCAN_BASE,
      style: 'scan',
      ansAcronym: 'ans',
      fetchImpl,
    });

    const result = await resolver.resolve('hackalice', {
      knownPartyId: 'other::1220aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    });
    expect(result.status).toBe('changed');
    expect(result.reasonCode).toBe('PARTY_CHANGED_SINCE_LAST_RESOLUTION');
  });
});
