# Phase 0 verification notes

## LocalNet (live E2E)

**Not run in the Cloud Agent VM** — Docker is not installed on the build environment (`docker: command not found`).

Follow [docs/localnet.md](./localnet.md) on a machine with Docker to verify:

1. Register `hackalice` via `http://ans.localhost:2000`
2. `curl "http://localhost:3847/api/cns/resolve?q=hackalice"` → `unverified` + real party ID

## Automated verification (this PR)

- `packages/resolver/src/live-resolver.test.ts` — mock `fetch` against recorded Splice `AnsEntry` JSON (LocalNet `.unverified.ans`, DevNet `dso.cns`, expiry, scan-proxy paths, `changed`).
- `src/__tests__/api-cns-resolve.test.ts` — route validation and demo-mode 503 fail-closed.
- `src/__tests__/server-config.test.ts` — preset wiring for `localnet` / DevNet migration env block.
- `src/__tests__/network-presets.test.ts` — DevNet URL is not MainNet default.

## DevNet switch (config only)

```env
NEXT_PUBLIC_CNS_MODE=live
NEXT_PUBLIC_CNS_NETWORK=devnet
CNS_NETWORK=devnet
CNS_UPSTREAM_STYLE=scan-proxy
CNS_UPSTREAM_URL=https://your-validator.example/api/validator
CNS_UPSTREAM_TOKEN=<jwt>
CNS_ANS_ACRONYM=cns
```
