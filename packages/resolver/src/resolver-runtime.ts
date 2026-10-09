import type { ResolveOptions, ResolveResult, Resolver } from './resolve-contract';
import { ResolveResultSchema } from './resolve-contract';
import { DemoResolver } from './demo-resolver';
import { LiveResolver, type LiveResolverOptions } from './live-resolver';
import { HttpEndpointResolver } from './http-endpoint-resolver';

/** DevNet Scan SV-1 base URL (not reachable without SV allowlisting). */
export const SCAN_API_URL_DEVNET =
  'https://scan.sv-1.dev.global.canton.network.sync.global/api/scan';

/** MainNet Scan SV-1 base URL (not reachable without SV allowlisting). */
export const SCAN_API_URL_MAINNET =
  'https://scan.sv-1.global.canton.network.sync.global/api/scan';

/**
 * @deprecated Prefer explicit `liveUpstream` or server-side `createResolveHandler`.
 * Historically defaulted to MainNet; do not use as an implicit live default.
 */
export const DEFAULT_SCAN_API_URL = SCAN_API_URL_MAINNET;

export type ResolverMode = 'demo' | 'live';

export type LiveTransport = 'http-endpoint' | 'direct';

export interface ResolverRuntimeConfig {
  mode: ResolverMode;
  /** @deprecated Use `liveUpstream` or `httpResolveUrl` for browser live mode */
  scanApiUrl?: string;
  /** How the browser reaches live data (default `http-endpoint`). */
  liveTransport?: LiveTransport;
  /** Same-origin resolve route (default `/api/cns/resolve`). */
  httpResolveUrl?: string;
  /** Direct Scan / scan-proxy config (server or legacy browser direct). */
  liveUpstream?: LiveResolverOptions;
}

let config: ResolverRuntimeConfig = {
  mode: 'demo',
};

let resolverInstance: Resolver | null = null;

/** Configure the global resolver (defaults to demo mode). Call once at app startup for live mode. */
export function configureResolver(partial: Partial<ResolverRuntimeConfig>): void {
  config = { ...config, ...partial };
  resolverInstance = null;
}

export function getResolverConfig(): ResolverRuntimeConfig {
  return { ...config };
}

export function getResolver(): Resolver {
  if (!resolverInstance) {
    if (config.mode === 'demo') {
      resolverInstance = new DemoResolver();
    } else {
      const transport = config.liveTransport ?? (config.scanApiUrl ? 'direct' : 'http-endpoint');
      if (transport === 'http-endpoint') {
        resolverInstance = new HttpEndpointResolver(config.httpResolveUrl ?? '/api/cns/resolve');
      } else if (config.liveUpstream) {
        resolverInstance = new LiveResolver(config.liveUpstream);
      } else if (config.scanApiUrl) {
        resolverInstance = new LiveResolver(config.scanApiUrl);
      } else {
        resolverInstance = new HttpEndpointResolver(config.httpResolveUrl ?? '/api/cns/resolve');
      }
    }
  }
  return resolverInstance;
}

export function resetResolver(): void {
  resolverInstance = null;
}

/** Headless resolve using the configured global resolver. */
export async function resolve(input: string, opts?: ResolveOptions): Promise<ResolveResult> {
  return getResolver().resolve(input, opts);
}

export function validateResolveResult(result: ResolveResult): ResolveResult {
  return ResolveResultSchema.parse(result);
}
