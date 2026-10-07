import { describe, it, expect } from 'vitest';
import { CNS_NETWORK_PRESETS, resolveNetworkId } from '@/lib/cns/network-presets';

describe('network presets', () => {
  it('localnet uses ans acronym and scan localhost URL', () => {
    expect(CNS_NETWORK_PRESETS.localnet.ansAcronym).toBe('ans');
    expect(CNS_NETWORK_PRESETS.localnet.upstreamUrl).toContain('scan.localhost');
    expect(CNS_NETWORK_PRESETS.localnet.registrationUiUrl).toContain('ans.localhost');
  });

  it('devnet scan URL is dev.global not mainnet', () => {
    expect(CNS_NETWORK_PRESETS.devnet.upstreamUrl).toContain('.dev.global.');
    expect(CNS_NETWORK_PRESETS.mainnet.upstreamUrl).not.toContain('.dev.');
  });

  it('resolveNetworkId falls back to demo', () => {
    expect(resolveNetworkId(undefined)).toBe('demo');
    expect(resolveNetworkId('LOCALNET')).toBe('localnet');
    expect(resolveNetworkId('bogus')).toBe('demo');
  });
});
