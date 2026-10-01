# Canton Names — Judge Pitch Script

**Total time: ~60 seconds**

---

## Problem (~10s)

On Canton, sending value still depends on long opaque party IDs that are easy to mistype and hard to trust. One wrong character can break a transfer or send to the wrong recipient.

---

## Solution (~10s)

Canton Names turns those IDs into readable names like alice.unverified.cns and gives any Canton app a drop-in recipient field that resolves the name to the right party and warns before sending if the name is missing, expired, or unverified.

---

## Who it's for (~8s)

It's built for Canton app teams making wallets, payments, settlement, and transfer flows — basically any app where users send value to counterparties.

---

## Proof (~12s)

We already have a working prototype: search, registration, public name pages, QR sharing, and a recipient demo. It runs locally in demo mode, with 55 passing tests and a clean build.

---

## Demo (~10s)

In the demo, we claim a name, share it, and then resolve it inside a mock transfer flow with safety checks.

---

## Ask (~10s)

We want DevNet or TestNet access and one Canton app team willing to pilot this live so we can prove readable names work in real transfers.
