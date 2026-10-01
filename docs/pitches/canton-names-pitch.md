# Canton Names

## Readable names for Canton party IDs

Canton Names turns long Canton party IDs into readable names like `alice.unverified.cns`, and gives any Canton app a drop-in field that sends to the right party every time.

**Speaker notes:**
- Open with the one-liner
- This is a hackathon MVP for AppsFactory Open Track
- Demo mode is fully functional; live registration is planned but untested

---

# The Problem

On Canton, you send value to a long, opaque party ID:

```
auth0_007c675a429eaf831f0991308d85::12201abe669f8c4d5e6f7a8b9c0d1e2f3...
```

You copy, paste, and hope you got it right.

**One wrong character → transfer fails or reaches the wrong party.**

CNS (Canton Name Service) exists, but search, registration, and resolution are hard to use directly.

**Speaker notes:**
- Party IDs are 66+ characters, impossible to share verbally
- Copy-paste errors happen — one character off and funds go nowhere or to the wrong party
- The underlying name service exists but has no user-friendly interface
- This is a real problem for anyone transferring value on Canton

---

# The Solution

**Canton Names** provides:

1. **Guided search & registration** — find available names, register in minutes
2. **Shareable name pages** — link + QR code for your name
3. **`CnsRecipientInput`** — drop-in component for any Canton app

The resolver warns on missing, expired, or unverified names **before** sending.

**Speaker notes:**
- Three parts: a user-facing app, shareable pages, and a developer component
- The resolver component is the growth lever — it shows names in context and prompts unnamed recipients to claim one
- Safety warnings help prevent errors before they happen

---

# Who It's For

**Primary: Canton app teams** building recipient/counterparty selection

- Wallets
- Tokenization & settlement platforms
- Payments & treasury apps
- Marketplaces

**Secondary: Party holders** who want shareable identities

- Validator operators, app providers, institutional desks, Canton Coin holders

**Best early adopter:** A Canton app team whose users transfer value.

**Speaker notes:**
- We're targeting developers first — they integrate the resolver, their users benefit
- The secondary audience registers names to receive payments
- Ideal pilot partner: a wallet or trading app with active users

---

# What's Built

**Routes:**
- `/` — Marketing landing page
- `/app` — Search for names
- `/app/register` — Multi-step registration flow
- `/app/names` — My registered names
- `/app/name/[name]` — Shareable details + QR
- `/app/demo/recipient` — Integration component demo

**Demo flow:**
Search → Connect wallet (simulated) → Approve fee → Confirm → Share → Resolve in recipient field

**Speaker notes:**
- Everything works in demo mode with simulated wallet and fixtures
- Registration includes proper state machine with idle, submitting, awaiting_wallet, awaiting_payment, confirmed states
- The recipient input component shows resolution, expiry warnings, and unverified labels

---

# Hardest Problems Solved

**Safe name-to-party resolution:**
- Handles nonexistent, expired, unverified, and changed-between-typing-and-sending cases
- Validates before send, not after

**Typed adapter layer:**
- Zod schemas validate all API responses
- Demo and live adapters share the same interface
- Swap adapters without changing UI code

**Registration state machine:**
- Unit-tested transitions through all states
- Handles rejection, timeout, and retry cleanly

**Speaker notes:**
- Resolution edge cases are the real complexity — what if a name expires while you're typing?
- The adapter pattern means demo mode is honest: same code paths, just different data source
- 18 state machine tests cover all transitions

---

# Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | TanStack Query |
| Validation | Zod |
| QR Codes | qrcode.react |
| Testing | Vitest |
| Package Manager | pnpm |

**Canton APIs:**
- **Scan API** — public lookups (no auth)
- **Validator App ANS API** — registration (JWT auth)

**Speaker notes:**
- Modern stack, strict TypeScript catches errors early
- shadcn/ui gives accessible, composable components
- TanStack Query handles caching, deduplication, and loading states
- Built against actual CNS OpenAPI specs

---

# Validation & Proof

**What we have:**
- 55 passing Vitest tests (types, state machine, fixtures)
- Clean typecheck and production build
- Full demo-mode walkthrough
- Built against CNS documentation and OpenAPI specs

**What we don't have (yet):**
- Real users — zero so far
- Live registration — untested on DevNet/TestNet
- Wallet connection — simulated, dApp SDK integration planned

**Speaker notes:**
- Be honest: this is a working demo, not a production system
- Tests prove the logic is sound; live testing proves it works on the network
- We need network access to take the next step

---

# Go-to-Market

**Developer-first via the resolver component.**

**First 10 users:**
- Hand-held integrations with 2–3 Canton wallet/app teams
- Direct outreach via community spaces, ecosystem calls, DMs

**First 100 users:**
- 3–5 integrated apps, each bringing 20–30 registrants
- Open-source component, technical post, case study

**Growth lever:** The embedded resolver — every integrated app shows names and prompts unnamed recipients to claim one.

**Speaker notes:**
- Acquisition: direct outreach + hands-on integration + open-source resolver
- Activation: claim a shareable name in under a minute
- Retention: your name is how people pay you across all integrated apps
- 10 and 100 are targets, not claims

---

# Pilot Metrics (Planned)

| Metric | Purpose |
|--------|---------|
| Registration completion rate | Funnel health |
| Time to register | UX friction |
| Failure points by step | Where users drop off |
| Resolver lookups | Component adoption |
| Recipient error reduction | Safety impact |
| Renewal rate | Retention signal |
| Integration time | Developer experience |

**Speaker notes:**
- These are the metrics we'll track during pilot
- No data yet — we need integrations to collect it
- Focus is on completion and error reduction

---

# What's Not Built Yet

**Immediate (for pilot):**
- Real wallet via Canton dApp SDK
- Live DevNet/TestNet registration with Canton Coin fees
- Session management (secure, not localStorage)

**Near-term:**
- Playwright E2E tests
- Public deployment
- Demo video
- Renewal reminders and notifications

**Future:**
- Name transfers
- Verified names (KYC/KYB)
- Subdomain support

**Speaker notes:**
- The MVP is demo-complete; live-complete requires network access
- dApp SDK integration is the critical path
- Everything else builds on having real transactions working

---

# The Ask

1. **DevNet or TestNet access** — credentials to register names with real Canton Coin fees

2. **One Canton wallet or app team willing to pilot the resolver** — embed `CnsRecipientInput`, provide feedback

That's what it takes to move Canton Names from demo mode to real transfers.

**Speaker notes:**
- We're not asking for funding or users — we're asking for access and one integration partner
- With that, we can validate the full flow and prove the value
- Contact: [include contact info when presenting]
