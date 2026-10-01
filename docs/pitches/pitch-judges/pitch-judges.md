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
- Runs locally in demo mode

**55 passing tests. Clean build.**

**Speaker notes:**
We already have a working prototype: search, registration, public name pages, QR sharing, and a recipient demo. It runs locally in demo mode, with 55 passing tests and a clean build.

---

# Demo

**Claim → Share → Resolve**

In the demo, we claim a name, share it, and then resolve it inside a mock transfer flow with safety checks.

**Speaker notes:**
In the demo, we claim a name, share it, and then resolve it inside a mock transfer flow with safety checks.

---

# The Ask

1. **DevNet or TestNet access**
2. **One Canton app team willing to pilot**

Prove readable names work in real transfers.

**Speaker notes:**
We want DevNet or TestNet access and one Canton app team willing to pilot this live so we can prove readable names work in real transfers.
