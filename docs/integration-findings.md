# Canton Name Service (CNS) Integration Findings

**Date Checked:** September 18, 2026
**Sources:**
- https://docs.canton.network/overview/reference/canton-name-service
- https://docs.canton.network/openapi/splice/validator/ans-external.yaml
- https://docs.canton.network/openapi/splice/scan/scan.yaml
- https://docs.canton.network/sdks-tools/sdks/dapp-sdk/overview
- https://docs.canton.network/sdks-tools/sdks/wallet-sdk/overview
- https://docs.canton.network/integrations/wallets

---

## Overview

The **Canton Name Service (CNS)** maps human-readable names to party identifiers on the Canton Network. It serves a similar function to DNS on the internet: instead of sharing a long, opaque party ID like `auth0_007c675a429eaf831f0991308d85::12201abe669f...`, users can share a name like `alice.unverified.cns`.

**Implementation Note:** CNS is implemented as Daml contracts on the Global Synchronizer. The underlying code is called the **Amulet Name Service (ANS)** in the Splice codebase.

---

## Name Format (VERIFIED)

- **Pattern:** `<chosen-name>.unverified.cns`
- The `.unverified.cns` suffix is automatically appended to all user-registered names
- **"unverified"** indicates no identity verification was performed on the registrant - anyone with a wallet and sufficient Canton Coin can register a name
- The DSO holds a special entry `dso.cns` with no expiration

**Naming Rules (to verify at registration time):**
- Name must end with `.unverified.cns` (or be normalized to include it)
- Specific character/length validation rules should be enforced by the Validator App

---

## Selected Network/Environment

**Target:** Canton DevNet (for development/testing)
- Scan API Base: `https://scan.sv-1.global.canton.network.sync.global/api/scan`
- LocalNet available via cn-quickstart for local development

**Production Note:** MainNet endpoints require separate configuration and real Canton Coin.

---

## Verified Endpoints & Schemas

### Public Scan API (No Authentication Required)

#### 1. Search/List Entries
```
GET /v0/ans-entries?name_prefix={prefix}&page_size={limit}
```

**Response Schema:**
```typescript
interface ListEntriesResponse {
  entries: AnsEntry[];
}

interface AnsEntry {
  contract_id?: string;      // Daml contract ID (absent for DSO entries)
  user: string;              // Owner party ID
  name: string;              // Full CNS name (e.g., "alice.unverified.cns")
  url: string;               // User-supplied URL or empty
  description: string;       // User-supplied description or empty
  expires_at?: string;       // ISO timestamp (null for DSO entries)
}
```

#### 2. Lookup by Exact Name
```
GET /v0/ans-entries/by-name/{name}
```

**Response:**
```typescript
interface LookupEntryByNameResponse {
  entry: AnsEntry;
}
```
- Returns 404 if name not found or expired

#### 3. Lookup by Party ID (Reverse Lookup)
```
GET /v0/ans-entries/by-party/{party}
```

**Response:**
```typescript
interface LookupEntryByPartyResponse {
  entry: AnsEntry;
}
```
- Returns first entry alphabetically if party owns multiple names

#### 4. Get ANS Rules (Configuration)
```
POST /v0/ans-rules
```
- Returns current fee and lifetime configuration
- Marked as "internal" in OpenAPI spec - may not be publicly accessible

---

### ANS API (Authentication Required)

**Base:** Validator App ANS API
**Authentication:** JWT token where subject matches the ledger API user

#### 1. Create Entry Request
```
POST /v0/entry/create
```

**Request:**
```typescript
interface CreateAnsEntryRequest {
  name: string;        // Must end with ".unverified.cns"
  url: string;         // Valid URL or empty, max 255 chars
  description: string; // Max 140 chars
}
```

**Response:**
```typescript
interface CreateAnsEntryResponse {
  entryContextCid: string;        // Contract ID
  subscriptionRequestCid: string; // Contract ID for wallet approval
  name: string;
  url: string;
  description: string;
}
```

#### 2. List User's Entries
```
GET /v0/entry/all
```

**Response:**
```typescript
interface ListAnsEntriesResponse {
  entries: AnsEntryResponse[];
}

interface AnsEntryResponse {
  contractId: string;
  name: string;
  amount: string;       // Fee amount
  unit: string;         // Currency unit
  expiresAt: string;    // ISO timestamp
  paymentInterval: string;
  paymentDuration: string;
}
```

---

## Registration Flow (VERIFIED)

```
1. User calls POST /v0/entry/create with name, url, description
   → Validator exercises AnsRules_RequestEntry choice
   → Creates AnsEntryContext contract
   → Creates SubscriptionRequest contract
   → Returns contract IDs to client

2. User accepts subscription request via wallet
   → Wallet triggers initial payment in Canton Coin
   
3. DSO automation collects payment
   → Exercises AnsEntryContext_CollectInitialEntryPayment
   → Burns Canton Coin (sent to DSO)
   → Creates AnsEntry contract
   
4. Entry is now active and resolvable via Scan API
```

**Critical Points:**
- Entry creation acknowledgement ≠ confirmation
- Must poll Scan API to confirm entry exists and owner matches
- Registration is NOT atomic - can fail at wallet approval or payment stage

---

## Authentication & User-to-Party Mapping

### dApp SDK (Recommended for Web Apps)

```typescript
import * as sdk from '@canton-network/dapp-sdk'

// Initialize on app load
await sdk.init()

// Connect wallet (user action)
const result = await sdk.connect()

// Get authenticated party
const account = await sdk.getPrimaryAccount()
const partyId = account.partyId
```

**Key Points:**
- Wallet handles authorization and signing
- dApp receives party ID after successful connection
- Browser-based wallet picker (extensions, remote wallets, WalletConnect)
- Sessions can be restored silently

### Wallet SDK (For Backend/Advanced Use)

```typescript
import { WalletSDK } from '@canton-network/wallet-sdk'

// For server-side operations with proper credentials
```

**Authentication Notes:**
- JWT tokens required for ANS API
- Token subject must match ledger API user
- Tokens are tied to specific validator hosting the party
- **Never store bearer tokens in localStorage**
- **Never trust browser-supplied party ID as ownership proof**

---

## Fee & Expiration Configuration

- **Entry Fee:** Configured in `AnsRulesConfig` on `AnsRules` contract
- **Entry Lifetime:** Configured per-network
- **Renewal:** Subscription-based, can be auto-renewed if wallet automation enabled
- **Expiration:** Entry archived if not renewed before `expires_at`
- **Payment:** Burned (sent to DSO party) - not redistributed

**To get current configuration:** Use POST /v0/ans-rules (if accessible) or document as network-specific

---

## Wallet Subscription Approval Flow

1. **Subscription Request Created:** After POST /v0/entry/create
2. **User Opens Wallet:** Via dApp SDK `connect()` or direct wallet access
3. **Wallet Shows Subscription:** Lists pending subscription requests
4. **User Accepts:** Triggers initial Canton Coin payment
5. **Automatic Processing:** DSO automation handles payment and entry creation

**UX Considerations:**
- Wallet redirect/callback is a navigation event, not payment proof
- Must reconcile final state against Scan API
- Handle cases: insufficient funds, user rejection, timeout

---

## Infrastructure Requirements

### For Live Mode
- Access to Canton Network (DevNet/TestNet/MainNet)
- Validator App with ANS API access
- Scan API endpoint
- User with Canton wallet containing sufficient Canton Coin

### For Demo Mode
- No external dependencies
- Deterministic fixtures for all states
- Simulated delays for realistic UX testing

### LocalNet (Local Development)
- Docker Compose environment from cn-quickstart
- Three validators: SV (4xxx), App Provider (3xxx), App User (2xxx)
- Wallet UI at http://wallet.localhost:{port}
- Scan UI at http://scan.localhost:4000

---

## Remaining Unknowns / To Verify with Live Testing

1. **Exact naming validation rules** - character sets, length limits, reserved words
2. **ANS Rules accessibility** - POST /v0/ans-rules may be internal-only
3. **Current fee amounts** on DevNet
4. **Entry lifetime duration** on DevNet
5. **Rate limits** on Scan API
6. **Error response formats** for specific failure cases
7. **Wallet connection timeout behavior**
8. **Subscription request expiration** if not accepted promptly

---

## Canton vs Ethereum/ENS Differences (IMPORTANT)

| Aspect | ENS (Ethereum) | CNS (Canton) |
|--------|----------------|--------------|
| Registration | Single transaction | Multi-step subscription flow |
| Payment | ETH gas + registration fee | Canton Coin subscription |
| Privacy | Public blockchain | Party-based privacy model |
| Signing | MetaMask/viem | Canton dApp SDK |
| Expiration | Annual renewal | Subscription-based renewal |
| Identity | Ethereum address | Canton party ID |

**Do NOT use:**
- MetaMask or viem
- EVM/Ethereum signing
- ENS-style domain resolution

**DO use:**
- @canton-network/dapp-sdk
- Canton wallet providers
- Scan API for resolution

---

## Scan API Server (Production)

Documented production endpoint:
```
https://scan.sv-1.global.canton.network.sync.global/api/scan
```

This connects to the Canton Network's Global Synchronizer via Super Validator 1.

---

## Summary: What We Can Build

### Fully Implementable (Public APIs)
- Name search and autocomplete
- Name availability checking
- Name resolution (name → party)
- Reverse resolution (party → name)
- Name details display
- Shareable name links and QR codes

### Implementable with Wallet Integration
- Registration request initiation
- User authentication via dApp SDK
- My names listing (for authenticated user)

### Requires Live Environment Testing
- Full registration flow end-to-end
- Wallet subscription approval
- Payment processing confirmation
- Renewal flows

### Demo Mode (Always Works)
- All UI flows with simulated data
- Deterministic test fixtures
- Registration state machine demonstration
