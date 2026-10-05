# @canton-names/resolver

[![npm version](https://img.shields.io/npm/v/@canton-names/resolver.svg)](https://www.npmjs.com/package/@canton-names/resolver)

Typed **safe recipient resolution** for Canton apps — drop-in UI + headless `resolve()` with confirm/block rules before a transfer.

> **Lookup is the product. Registration is support. Safety is the differentiator.**

**npm:** [@canton-names/resolver@0.1.2](https://www.npmjs.com/package/@canton-names/resolver)

## Install

```bash
npm install @canton-names/resolver
```

Peer dependencies: `react` and `react-dom` (UI only).

## 5-minute quickstart (demo mode)

Install → paste → type `bank` or `alice` → see **ok** vs **confirm** vs **blocked**. No Canton credentials.

```tsx
'use client';

import { useState } from 'react';
import { configureResolver } from '@canton-names/resolver';
import { CnsRecipientInput } from '@canton-names/resolver/react';
import '@canton-names/resolver/styles.css';

configureResolver({ mode: 'demo' });

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

### Demo names

| Input | Status | Notes |
|-------|--------|--------|
| `bank` / `bank.cns` | `ok` | Verified `.cns` — safe immediately |
| `alice` / `alice.unverified.cns` | `unverified` | Confirm before send; never labeled “Verified” |
| `changed-party` | `changed` | Party ID vs last-known cache |
| `expired-name` | `expired` | Blocked |
| unknown | `missing` | Blocked |

## Headless `resolve()`

```ts
import { configureResolver, resolve } from '@canton-names/resolver';

configureResolver({ mode: 'demo' });

const result = await resolve('bank');
// result.status: ok | missing | expired | unverified | changed
```

- **Confirm** before use: `unverified`, `changed` (party ID differs from last known resolution + cache).
- **Block**: `missing`, `expired`, invalid input, `RESOLVER_UNAVAILABLE`.

## Live mode

```ts
configureResolver({
  mode: 'live',
  scanApiUrl: 'https://scan.sv-1.global.canton.network.sync.global/api/scan',
});
```

## Exports

| Import | Contents |
|--------|----------|
| `@canton-names/resolver` | Zod + TS contract, `configureResolver`, `resolve()`, `DemoResolver` / `LiveResolver`, cache helpers |
| `@canton-names/resolver/react` | `CnsRecipientInput`, `useCnsResolve` |
| `@canton-names/resolver/styles.css` | Self-contained styles (no Tailwind config) |

## Maintainers (monorepo)

```bash
pnpm --filter @canton-names/resolver build
pnpm --filter @canton-names/resolver pack
```

Publish from `packages/resolver` when releasing a new version (`pnpm publish --access public` for the org scope).
