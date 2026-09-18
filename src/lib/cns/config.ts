import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_CNS_MODE: z.enum(['live', 'demo']).default('demo'),
  NEXT_PUBLIC_SCAN_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_VALIDATOR_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_NETWORK_NAME: z.string().default('DevNet'),
});

function getEnvConfig() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_CNS_MODE: process.env.NEXT_PUBLIC_CNS_MODE,
    NEXT_PUBLIC_SCAN_API_URL: process.env.NEXT_PUBLIC_SCAN_API_URL,
    NEXT_PUBLIC_VALIDATOR_API_URL: process.env.NEXT_PUBLIC_VALIDATOR_API_URL,
    NEXT_PUBLIC_NETWORK_NAME: process.env.NEXT_PUBLIC_NETWORK_NAME,
  });

  if (!parsed.success) {
    console.warn('Invalid environment configuration, using defaults:', parsed.error.issues);
    return {
      NEXT_PUBLIC_CNS_MODE: 'demo' as const,
      NEXT_PUBLIC_SCAN_API_URL: undefined,
      NEXT_PUBLIC_VALIDATOR_API_URL: undefined,
      NEXT_PUBLIC_NETWORK_NAME: 'DevNet',
    };
  }

  return parsed.data;
}

const env = getEnvConfig();

export const cnsConfig = {
  mode: env.NEXT_PUBLIC_CNS_MODE,
  scanApiUrl: env.NEXT_PUBLIC_SCAN_API_URL ?? 'https://scan.sv-1.global.canton.network.sync.global/api/scan',
  validatorApiUrl: env.NEXT_PUBLIC_VALIDATOR_API_URL ?? '',
  network: env.NEXT_PUBLIC_NETWORK_NAME,
  isDemo: env.NEXT_PUBLIC_CNS_MODE === 'demo',
} as const;

export function isDemoMode(): boolean {
  return cnsConfig.isDemo;
}

export function getNetworkName(): string {
  return cnsConfig.isDemo ? `${cnsConfig.network} (Demo)` : cnsConfig.network;
}
