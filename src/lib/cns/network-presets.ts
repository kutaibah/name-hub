import type { UpstreamStyle } from '@canton-names/resolver';

export type CnsNetworkId = 'demo' | 'localnet' | 'devnet' | 'mainnet';

export interface CnsNetworkPreset {
  id: CnsNetworkId;
  displayName: string;
  ansAcronym: string;
  /** Scan or validator scan-proxy API base (no trailing path beyond /api/scan or validator root). */
  upstreamUrl: string;
  upstreamStyle: UpstreamStyle;
  /** LocalNet ANS registration UI (wallet-hosted). */
  registrationUiUrl?: string;
}

export const CNS_NETWORK_PRESETS: Record<Exclude<CnsNetworkId, 'demo'>, CnsNetworkPreset> = {
  localnet: {
    id: 'localnet',
    displayName: 'LocalNet',
    ansAcronym: 'ans',
    upstreamUrl: 'http://scan.localhost:4000/api/scan',
    upstreamStyle: 'scan',
    registrationUiUrl: 'http://ans.localhost:2000',
  },
  devnet: {
    id: 'devnet',
    displayName: 'DevNet',
    ansAcronym: 'cns',
    upstreamUrl: 'https://scan.sv-1.dev.global.canton.network.sync.global/api/scan',
    upstreamStyle: 'scan',
  },
  mainnet: {
    id: 'mainnet',
    displayName: 'MainNet',
    ansAcronym: 'cns',
    upstreamUrl: 'https://scan.sv-1.global.canton.network.sync.global/api/scan',
    upstreamStyle: 'scan',
  },
};

export function resolveNetworkId(raw: string | undefined): CnsNetworkId {
  const value = (raw ?? 'demo').toLowerCase();
  if (value === 'demo' || value === 'localnet' || value === 'devnet' || value === 'mainnet') {
    return value;
  }
  return 'demo';
}
