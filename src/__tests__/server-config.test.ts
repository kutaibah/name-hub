import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCnsServerUpstreamConfig, describeDevNetMigration } from '@/lib/cns/server-config';

describe('server config', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it('returns null in demo mode', () => {
    process.env.NEXT_PUBLIC_CNS_MODE = 'demo';
    expect(getCnsServerUpstreamConfig()).toBeNull();
  });

  it('builds localnet upstream from preset', () => {
    process.env.NEXT_PUBLIC_CNS_MODE = 'live';
    process.env.CNS_NETWORK = 'localnet';
    const cfg = getCnsServerUpstreamConfig();
    expect(cfg?.networkId).toBe('localnet');
    expect(cfg?.upstream.baseUrl).toContain('scan.localhost');
    expect(cfg?.upstream.style).toBe('scan');
    expect(cfg?.upstream.ansAcronym).toBe('ans');
  });

  it('document devnet migration env block', () => {
    expect(describeDevNetMigration()).toContain('scan-proxy');
    expect(describeDevNetMigration()).toContain('CNS_NETWORK=devnet');
  });
});
