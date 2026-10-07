import { z } from 'zod';
import type { LiveResolverOptions, UpstreamStyle } from '@canton-names/resolver';
import {
  CNS_NETWORK_PRESETS,
  resolveNetworkId,
  type CnsNetworkId,
} from './network-presets';

const serverEnvSchema = z.object({
  CNS_NETWORK: z.string().optional(),
  CNS_UPSTREAM_URL: z.string().url().optional(),
  CNS_UPSTREAM_STYLE: z.enum(['scan', 'scan-proxy']).optional(),
  CNS_UPSTREAM_TOKEN: z.string().optional(),
  CNS_ANS_ACRONYM: z.string().optional(),
});

function readServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    CNS_NETWORK: process.env.CNS_NETWORK,
    CNS_UPSTREAM_URL: process.env.CNS_UPSTREAM_URL,
    CNS_UPSTREAM_STYLE: process.env.CNS_UPSTREAM_STYLE,
    CNS_UPSTREAM_TOKEN: process.env.CNS_UPSTREAM_TOKEN,
    CNS_ANS_ACRONYM: process.env.CNS_ANS_ACRONYM,
  });
  return parsed.success ? parsed.data : {};
}

export interface CnsServerUpstreamConfig {
  networkId: CnsNetworkId;
  displayName: string;
  upstream: LiveResolverOptions;
  registrationUiUrl?: string;
}

export function getCnsServerUpstreamConfig(): CnsServerUpstreamConfig | null {
  const mode = (process.env.NEXT_PUBLIC_CNS_MODE ?? 'demo').toLowerCase();
  if (mode !== 'live') {
    return null;
  }

  const env = readServerEnv();
  const networkId = resolveNetworkId(env.CNS_NETWORK ?? process.env.NEXT_PUBLIC_CNS_NETWORK);
  if (networkId === 'demo') {
    return null;
  }

  const preset = CNS_NETWORK_PRESETS[networkId];
  const baseUrl = env.CNS_UPSTREAM_URL ?? preset.upstreamUrl;
  const style: UpstreamStyle = env.CNS_UPSTREAM_STYLE ?? preset.upstreamStyle;
  const ansAcronym = env.CNS_ANS_ACRONYM ?? preset.ansAcronym;
  const token = env.CNS_UPSTREAM_TOKEN;

  const upstream: LiveResolverOptions = {
    baseUrl,
    style,
    ansAcronym,
    getAuthHeaders: token
      ? () => ({ Authorization: `Bearer ${token}` })
      : undefined,
  };

  return {
    networkId,
    displayName: preset.displayName,
    upstream,
    registrationUiUrl: preset.registrationUiUrl,
  };
}

/** DevNet later: set `CNS_NETWORK=devnet`, `CNS_UPSTREAM_STYLE=scan-proxy`, and `CNS_UPSTREAM_URL` to your validator base. */
export function describeDevNetMigration(): string {
  return [
    'CNS_NETWORK=devnet',
    'CNS_UPSTREAM_STYLE=scan-proxy',
    'CNS_UPSTREAM_URL=https://your-validator.example/api/validator',
    'CNS_UPSTREAM_TOKEN=<service-jwt>',
    'NEXT_PUBLIC_CNS_MODE=live',
    'NEXT_PUBLIC_CNS_NETWORK=devnet',
  ].join('\n');
}
