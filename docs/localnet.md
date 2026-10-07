# Splice LocalNet with Canton Names

Use LocalNet to exercise **real** ANS lookup APIs without DevNet allowlisting. The app stays in **demo** mode on Vercel; locally you switch to **live** mode and point server env vars at LocalNet.

## Prerequisites

- Docker with Compose v2
- ~8 GB RAM for the full LocalNet profile
- This repo: Node 24, pnpm 10.33.3 (Corepack)

## Start Splice LocalNet

Follow the official guide: [Splice LocalNet testing](https://docs.canton.network/appdev/quickstart/faq) and the compose bundle in [canton-network/splice `cluster/compose/localnet`](https://github.com/canton-network/splice/tree/main/cluster/compose/localnet).

Typical flow:

```bash
git clone https://github.com/canton-network/splice.git
cd splice/cluster/compose/localnet
docker compose --profile sv --profile app-provider --profile app-user up -d
```

Add `127.0.0.1 scan.localhost wallet.localhost ans.localhost` to `/etc/hosts` if your environment does not resolve `*.localhost`.

### URLs (app-user validator)

| Service | URL |
|--------|-----|
| Scan API | `http://scan.localhost:4000/api/scan` |
| Validator API | `http://wallet.localhost:2000/api/validator` |
| Wallet UI | `http://wallet.localhost:2000` |
| ANS / name UI | `http://ans.localhost:2000` |

LocalNet uses the ANS acronym **`ans`** (names look like `alice.unverified.ans`).

## Register a test name

1. Open the wallet UI and tap Amulet (DevNet-style faucet is enabled on LocalNet).
2. Open `http://ans.localhost:2000` and register a name (for example `hackalice`).
3. Confirm via Scan:

```bash
curl -s "http://scan.localhost:4000/api/scan/v0/ans-entries/by-name/hackalice.unverified.ans" | jq .
```

## Run name-hub against LocalNet

`.env.local`:

```env
NEXT_PUBLIC_CNS_MODE=live
NEXT_PUBLIC_CNS_NETWORK=localnet

CNS_NETWORK=localnet
# optional overrides (defaults match the localnet preset):
# CNS_UPSTREAM_URL=http://scan.localhost:4000/api/scan
# CNS_UPSTREAM_STYLE=scan
# CNS_ANS_ACRONYM=ans
```

```bash
pnpm install
pnpm dev
```

Try:

- Demo recipient page: `/app/demo/recipient`
- API: `curl "http://localhost:3847/api/cns/resolve?q=hackalice"`

Registration in the app still defers to the wallet; on LocalNet, live registration errors include a link to `http://ans.localhost:2000`.

## Move to DevNet later (config only)

On a validator with an allowlisted egress IP, expose scan-proxy and set:

```env
NEXT_PUBLIC_CNS_MODE=live
NEXT_PUBLIC_CNS_NETWORK=devnet
CNS_NETWORK=devnet
CNS_UPSTREAM_STYLE=scan-proxy
CNS_UPSTREAM_URL=https://your-validator.example/api/validator
CNS_UPSTREAM_TOKEN=<service-jwt>
CNS_ANS_ACRONYM=cns
```

No application code changes are required beyond env.

## What `ok` means (live)

- **DSO/SV-style entries** (for example `dso.cns` on DevNet): no `.unverified.<acronym>` suffix, or DSO-provided entries without `contract_id` / `expires_at`.
- **Trusted address book**: if the caller supplies `knownPartyId` (or client cache) matching the resolved party, status is `ok` even for `.unverified.*` names.
- Otherwise user-registered names resolve to **`unverified`** (confirm before send).
