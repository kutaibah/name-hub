import type { ResolveOptions, ResolveResult, Resolver } from './resolve-contract';
import { ResolveResultSchema } from './resolve-contract';
import { DemoResolver } from './demo-resolver';
import { LiveResolver } from './live-resolver';

export const DEFAULT_SCAN_API_URL =
  'https://scan.sv-1.global.canton.network.sync.global/api/scan';

export type ResolverMode = 'demo' | 'live';

export interface ResolverRuntimeConfig {
  mode: ResolverMode;
  scanApiUrl: string;
}

let config: ResolverRuntimeConfig = {
  mode: 'demo',
  scanApiUrl: DEFAULT_SCAN_API_URL,
};

let resolverInstance: Resolver | null = null;

/** Configure the global resolver (defaults to demo mode). Call once at app startup for live mode. */
export function configureResolver(partial: Partial<ResolverRuntimeConfig>): void {
  config = { ...config, ...partial };
  resolverInstance = null;
}

export function getResolver(): Resolver {
  if (!resolverInstance) {
    resolverInstance =
      config.mode === 'live'
        ? new LiveResolver(config.scanApiUrl)
        : new DemoResolver();
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
