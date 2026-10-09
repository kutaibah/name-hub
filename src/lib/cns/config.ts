import { z } from 'zod';
import { CNS_NETWORK_PRESETS, resolveNetworkId, type CnsNetworkId } from './network-presets';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_CNS_MODE: z.enum(['live', 'demo']).default('demo'),
  NEXT_PUBLIC_CNS_NETWORK: z.string().optional(),
  NEXT_PUBLIC_CNS_RESOLVE_URL: z.string().default('/api/cns/resolve'),
});

function getEnvConfig() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_CNS_MODE: process.env.NEXT_PUBLIC_CNS_MODE,
    NEXT_PUBLIC_CNS_NETWORK: process.env.NEXT_PUBLIC_CNS_NETWORK,
    NEXT_PUBLIC_CNS_RESOLVE_URL: process.env.NEXT_PUBLIC_CNS_RESOLVE_URL,
  });

  if (!parsed.success) {
    console.warn('Invalid environment configuration, using defaults:', parsed.error.issues);
    return {
      NEXT_PUBLIC_CNS_MODE: 'demo' as const,
      NEXT_PUBLIC_CNS_NETWORK: 'demo',
      NEXT_PUBLIC_CNS_RESOLVE_URL: '/api/cns/resolve',
    };
  }

  return parsed.data;
}

const env = getEnvConfig();
const networkId: CnsNetworkId = resolveNetworkId(env.NEXT_PUBLIC_CNS_NETWORK);

function networkDisplayName(): string {
  if (networkId === 'demo' || env.NEXT_PUBLIC_CNS_MODE === 'demo') {
    return 'Demo';
  }
  return CNS_NETWORK_PRESETS[networkId]?.displayName ?? networkId;
}

export const cnsConfig = {
  mode: env.NEXT_PUBLIC_CNS_MODE,
  networkId,
  httpResolveUrl: env.NEXT_PUBLIC_CNS_RESOLVE_URL,
  network: networkDisplayName(),
  isDemo: env.NEXT_PUBLIC_CNS_MODE === 'demo',
  registrationUiUrl:
    networkId !== 'demo' && networkId !== 'mainnet'
      ? CNS_NETWORK_PRESETS[networkId]?.registrationUiUrl
      : undefined,
} as const;

export function isDemoMode(): boolean {
  return cnsConfig.isDemo;
}

export function getNetworkName(): string {
  return cnsConfig.isDemo ? `${cnsConfig.network} (Demo)` : cnsConfig.network;
}
