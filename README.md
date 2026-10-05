# Canton Names

**Safe recipient resolution for Canton apps** — a drop-in field and typed resolver so users send transfers to readable names, not raw party IDs, with warnings and blocks before money moves to the wrong party.

> **Lookup is the product. Registration is support. Safety is the differentiator.**

This repo is **developer-first**: the npm package and resolve contract are the product. The web app is a demo shell, docs, and optional registration support — not a consumer name marketplace.

---

## npm package (start here)

| | |
|---|---|
| **Package** | [`@canton-names/resolver@0.1.2`](https://www.npmjs.com/package/@canton-names/resolver) |
| **Install** | `npm install @canton-names/resolver` |

**Goal:** install → drop in `CnsRecipientInput` → resolve a readable name with the correct warning state in **under 5 minutes** (demo mode, no network credentials).

```bash
npm install @canton-names/resolver
```

```tsx
'use client';

import { useState } from 'react';
import { configureResolver, resolve } from '@canton-names/resolver';
import { CnsRecipientInput } from '@canton-names/resolver/react';
import '@canton-names/resolver/styles.css';

configureResolver({ mode: 'demo' }); // default for quickstart

export function TransferForm() {
  const [partyId, setPartyId] = useState<string | null>(null);

  return (
    <form>
      <CnsRecipientInput
        label="Recipient"
        onChange={({ partyId }) => setPartyId(partyId)}
      />
      <button type="submit" disabled={!partyId}>Send</button>
    </form>
  );
}
```

Headless use:

```ts
import { configureResolver, resolve } from '@canton-names/resolver';

configureResolver({ mode: 'demo' });
const result = await resolve('bank');
```

- **Exports:** `@canton-names/resolver` (contract, `configureResolver`, `resolve`, demo/live resolvers, cache) · `@canton-names/resolver/react` (`CnsRecipientInput`) · `@canton-names/resolver/styles.css` (no Tailwind required)
- **More detail:** [packages/resolver/README.md](./packages/resolver/README.md) · hosted quickstart at `/docs` when running this app

---

## Resolve contract

Statuses: `ok` | `missing` | `expired` | `unverified` | `changed`

| Status | `partyId` | Confirm before send? | Block send? | When |
|--------|-----------|----------------------|-------------|------|
| `ok` | yes | no | no | Safe to use (e.g. verified `bank.cns`) |
| `unverified` | yes | **yes** | no | Name exists; not identity-verified (`.unverified.cns`) |
| `changed` | yes | **yes** | no | Party ID differs from **last known resolution** (options + local cache) |
| `missing` | no | no | **yes** | Not found, invalid input, party not found, or `RESOLVER_UNAVAILABLE` |
| `expired` | no | no | **yes** | Name past expiry |

**Rules**

- **Confirm** only for `unverified` and `changed`. The `onChange` callback exposes a usable `partyId` only after `ok`, or after the user confirms.
- **Block** for `missing`, `expired`, invalid input, and resolver unavailable.
- **`changed`** compares the resolved party ID to the caller’s `lastKnown` / `knownPartyId` and the package’s last-known cache — not a generic “name changed” flag.

**Demo fixtures** (with `configureResolver({ mode: 'demo' })`):

| Try | Resolves to | UI |
|-----|-------------|-----|
| `bank` / `bank.cns` | `ok` (verified) | Ready to send — **Verified** only on `.cns`, never on `.unverified.cns` |
| `alice` / `alice.unverified.cns` | `unverified` | Amber — user must confirm |
| `changed-party` | `changed` | Confirm party ID change |
| `expired-name` | `expired` | Blocked |
| unknown name | `missing` | Blocked |

---

## This monorepo (secondary)

Hackathon MVP workspace: the **resolver package** plus a Next.js demo UI.

| Area | URL (local `pnpm dev`, port **3847**) |
|------|----------------------------------------|
| Marketing | `/` |
| 5-minute docs | `/docs` |
| Demo app (search, integration mock transfer) | `/app`, `/app/demo/recipient` |
| Registration (supporting flow, demo/simulated) | `/app/register` |

**Demo mode is the default** for the app and package quickstart: simulated data and payments, not live Canton Network registration or production transfers.

### Run the app

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3847](http://localhost:3847). Node 20+, pnpm 10+.

### Live resolver (optional)

For Scan API lookups instead of demo fixtures, set in `.env.local`:

```env
NEXT_PUBLIC_CNS_MODE=live
NEXT_PUBLIC_SCAN_API_URL=https://scan.sv-1.global.canton.network.sync.global/api/scan
```

You need appropriate network access and wallet/validator setup; this repo does not claim live-network registration or production readiness.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (builds resolver first) |
| `pnpm build` | Build resolver + Next.js production bundle |
| `pnpm start` | Production server |
| `pnpm test` | Package (44) + app (55) Vitest tests |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm build:resolver` | Build `@canton-names/resolver` only |

---

## Project structure

```
packages/resolver/     # @canton-names/resolver (published)
src/
  app/(marketing)/     # /, /docs, legal
  app/(app)/app/       # Demo UI: search, register, integration demo
  components/cns/      # App wrappers; integration uses the npm package
  lib/cns/             # App adapters, registration, config
```

---

## Tech stack

Next.js 16 (App Router), TypeScript, Tailwind + shadcn/ui (demo app only), TanStack Query, Zod, Vitest.

Further notes: [docs/architecture.md](./docs/architecture.md), [docs/integration-findings.md](./docs/integration-findings.md).

---

## License

MIT — see [packages/resolver/LICENSE](./packages/resolver/LICENSE).

## Disclaimer

Hackathon / demo software. Not affiliated with Digital Asset, Canton Network, or the DSO. Names ending in `.unverified.cns` are not identity-verified; anyone with Canton Coin could register an available name in a live deployment. Do not treat demo resolution or registration as proof of real-world ownership.
