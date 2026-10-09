# Canton Names

## Readable names for Canton party IDs

**Speaker notes:**
Title slide. Pause briefly, then move to Problem.

---

# The Problem

Long opaque party IDs that are easy to mistype and hard to trust.

One wrong character → transfer fails or wrong recipient.

**Speaker notes:**
On Canton, sending value still depends on long opaque party IDs that are easy to mistype and hard to trust. One wrong character can break a transfer or send to the wrong recipient.

---

# The Solution

**Canton Names** turns party IDs into readable names like `alice.unverified.cns`

Drop-in recipient field that:
- Resolves the name to the right party
- Warns before sending if the name is missing, expired, or unverified

**Speaker notes:**
Canton Names turns those IDs into readable names like alice.unverified.cns and gives any Canton app a drop-in recipient field that resolves the name to the right party and warns before sending if the name is missing, expired, or unverified.

---

# Who It's For

**Canton app teams** building:
- Wallets
- Payments
- Settlement
- Transfer flows

Any app where users send value to counterparties.

**Speaker notes:**
It's built for Canton app teams making wallets, payments, settlement, and transfer flows — basically any app where users send value to counterparties.

---

# Proof

**Working prototype:**
- Search, registration, public name pages, QR sharing
- Recipient component demo
- Server resolve path + network presets (Phase 0)

**115+ passing tests. Clean build.** Demo mode ships on Vercel today.

**Speaker notes:**
We have search, registration, public pages, QR sharing, and the recipient demo. Phase 0 adds a server-side resolve path and network presets. Demo mode still ships on Vercel; tests and build are green.

---

# Real network access

**The challenge:** DevNet needs a validator sponsored by an SV, with a fixed egress IP they allowlist. Scan is IP-allowlisted too (we saw 403). Docs say 2–7 days; FAQ says up to 2–4 weeks. With ~2 days left in the hackathon, we can’t count on DevNet in time.

**Phase 0 instead:** `/api/cns/resolve`, presets (demo/localnet/devnet/mainnet), one live resolver mapping to safe statuses, LocalNet runbook. DevNet later is a config change (upstream URL + token).

**Honest verification:** fixture tests match real Splice API shapes; LocalNet E2E not yet run on our side.

**Speaker notes:**
Be direct about access friction and timeline. Phase 0 is the architecture bet; don’t overclaim live DevNet.

---

# Demo

**Claim → Share → Resolve**

In the demo, we claim a name, share it, and then resolve it inside a mock transfer flow with safety checks.

**Speaker notes:**
In the demo, we claim a name, share it, and then resolve it inside a mock transfer flow with safety checks.

---

# The Ask

1. **DevNet sponsorship** — validator access or an allowlisted node so we can flip the preset and go live
2. **One Canton app team willing to pilot** the resolver in a real transfer flow

We have the resolve path; we need network access and a pilot to prove it in production.

**Speaker notes:**
We want DevNet or TestNet access and one Canton app team willing to pilot this live so we can prove readable names work in real transfers.
