# Canton Names - Hackathon Brief

## Problem

Canton Network users face a fundamental usability challenge: party identifiers are long, complex strings like `auth0_007c675a429eaf831f0991308d85::12201abe669f...`. These identifiers are:

- **Hard to share**: Can't be communicated verbally
- **Error-prone**: Easy to mistype or truncate
- **Not memorable**: Users can't remember their own or others' IDs
- **Intimidating**: Complex strings discourage adoption

## Target Audience

1. **Canton Wallet Users**: Need to share payment destinations
2. **Application Developers**: Building on Canton Network
3. **Canton Coin Recipients**: Want easy-to-share addresses
4. **Organizations**: Want recognizable on-chain identities

## Solution: Canton Names

A web-based name service client that:

1. **Simplifies Identities**: Replace complex party IDs with readable names
2. **Enables Discovery**: Search for available names instantly
3. **Streamlines Registration**: Guided multi-step registration flow
4. **Provides Integration**: Reusable component for other apps

### Name Format

All user names follow the pattern: `<chosen-name>.unverified.cns`

The `.unverified.cns` suffix clearly indicates that names are not identity-verified—anyone with Canton Coin can register any available name.

## Value Proposition

### For Users

| Without Canton Names | With Canton Names |
|---------------------|-------------------|
| Share: `auth0_007c675...::1220...` | Share: `alice.unverified.cns` |
| Copy-paste errors | One-click copy |
| No discoverability | Search & browse |
| Manual ID management | Managed expiration |

### For Developers

- Drop-in `CnsRecipientInput` component
- Pre-built name resolution hooks
- Consistent UX patterns
- Documented API integration

## Why Canton?

Canton Network provides unique characteristics that make it ideal for a name service:

1. **Privacy Model**: Party-based privacy allows targeted name resolution
2. **Smart Contract Support**: Names are Daml contracts with clear ownership
3. **Subscription Model**: Built-in renewal mechanism via wallet
4. **Network Infrastructure**: Scan API provides public lookup

### Technical Alignment

- Uses existing ANS (Amulet Name Service) infrastructure
- Integrates with Canton wallet ecosystem
- Follows Splice API patterns
- Compatible with Global Synchronizer

## Differentiators

### Compared to Other Name Services

| Feature | Canton Names | ENS (Ethereum) |
|---------|--------------|----------------|
| Privacy | Party-based | Public addresses |
| Registration | Subscription flow | Single transaction |
| Payment | Canton Coin | ETH |
| Verification | "Unverified" label | Optional ENS profiles |

### Product Differentiators

1. **Polished Registration UX**: Multi-step flow with clear status
2. **Reusable Components**: `CnsRecipientInput` for integration
3. **Demo Mode**: Full exploration without wallet/funds
4. **Transparent Labeling**: Clear "unverified" messaging

## Demo Path

```
Search → Authenticate → Request Registration → Approve Payment → 
Confirm Registered Name → Resolve in Integration Demo
```

## Future Vision (Not Implemented)

### Near-Term

- Full dApp SDK wallet integration
- Renewal notifications
- Transfer functionality
- Batch registration

### Medium-Term

- Verified names (KYC/KYB integration)
- Name marketplace
- Subdomain support
- Profile pages

### Long-Term

- Cross-application name resolution SDK
- Enterprise white-label solution
- Name-based authorization

## Technical Summary

| Stack | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack Query |
| Validation | Zod |
| Testing | Vitest |

## Team

Solo project for AppsFactory Open Track hackathon.

## Repository

The complete source code, documentation, and demo are available in this repository.
