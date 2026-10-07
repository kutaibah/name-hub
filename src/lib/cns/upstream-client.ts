import { LiveResolver } from '@canton-names/resolver';
import { getCnsServerUpstreamConfig } from './server-config';

let liveResolver: LiveResolver | null = null;

export function getServerLiveResolver(): LiveResolver | null {
  const cfg = getCnsServerUpstreamConfig();
  if (!cfg) return null;
  if (!liveResolver) {
    liveResolver = new LiveResolver(cfg.upstream);
  }
  return liveResolver;
}

export function resetServerLiveResolver(): void {
  liveResolver = null;
}
