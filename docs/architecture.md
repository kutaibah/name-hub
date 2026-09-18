# Canton Names Architecture

## Overview

Canton Names is a Next.js web application that provides a user interface for the Canton Name Service (CNS), also known as Amulet Name Service (ANS). The application follows a clean separation between UI components, business logic, and external API integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Canton Names Web App                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │    State/Context    │  │
│  │  (App Dir)  │  │ (cns/, ui/) │  │  (React Query, Auth)│  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│  ┌──────▼─────────────────▼─────────────────────▼──────────┐│
│  │                     Hooks Layer                         ││
│  │      (useNameAvailability, useCnsResolve, etc.)         ││
│  └──────────────────────────┬──────────────────────────────┘│
│                             │                                │
│  ┌──────────────────────────▼──────────────────────────────┐│
│  │                    Adapter Layer                         ││
│  │  ┌─────────────────┐       ┌─────────────────────────┐  ││
│  │  │   DemoAdapter   │       │     LiveAdapter         │  ││
│  │  │  (Fixtures)     │       │  (Scan API, ANS API)    │  ││
│  │  └─────────────────┘       └─────────────────────────┘  ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │   Scan API      │             │    ANS API      │
    │   (Public)      │             │ (Authenticated) │
    │                 │             │                 │
    │ - Search        │             │ - Create Entry  │
    │ - Lookup        │             │ - List Entries  │
    │ - Resolve       │             │                 │
    └─────────────────┘             └─────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
                   ┌─────────────────┐
                   │  Canton Network │
                   │  (Global Sync)  │
                   └─────────────────┘
```

## Key Components

### Adapter Layer

The adapter pattern isolates the application from the external APIs:

```typescript
interface CnsReadAdapter {
  lookupByName(name: string): Promise<AnsEntry | null>;
  lookupByParty(partyId: string): Promise<AnsEntry | null>;
  searchByPrefix(prefix: string, limit?: number): Promise<AnsEntry[]>;
  checkAvailability(name: string): Promise<NameAvailability>;
  resolve(name: string): Promise<ResolvedName | null>;
}

interface CnsRegistrationAdapter {
  requestRegistration(request: CreateAnsEntryRequest): Promise<CreateAnsEntryResponse>;
  getUserEntries(): Promise<UserAnsEntry[]>;
  getRegistrationConfig(): Promise<{ fee: string; unit: string; lifetimeDays: number }>;
}
```

Two implementations:
- **DemoAdapter**: Returns fixtures with simulated delays
- **LiveAdapter**: Calls real Canton Network APIs

### Registration State Machine

The registration flow is modeled as a state machine:

```
┌───────┐
│ idle  │
└───┬───┘
    │ START
    ▼
┌───────┐
│ ready │
└───┬───┘
    │ SUBMIT
    ▼
┌────────────┐
│ submitting │
└─────┬──────┘
      │ (API response)
      ▼
┌──────────────────┐     WALLET_REJECTED    ┌──────────┐
│ awaiting_wallet  │ ─────────────────────► │ rejected │
└────────┬─────────┘                        └──────────┘
         │ WALLET_ACCEPTED
         ▼
┌──────────────────┐
│ awaiting_payment │
└────────┬─────────┘
         │ PAYMENT_PROCESSING
         ▼
┌────────────────────────┐
│ awaiting_confirmation  │
└────────────┬───────────┘
             │ ENTRY_CONFIRMED
             ▼
      ┌───────────┐
      │ confirmed │
      └───────────┘
```

Error states: `failed`, `rejected`, `timeout`

### Authentication Flow

```
┌────────────┐                    ┌────────────┐
│   User     │                    │   Wallet   │
└─────┬──────┘                    └──────┬─────┘
      │ Click "Connect Wallet"           │
      │                                  │
      ▼                                  │
┌─────────────┐     connect()     ┌──────▼─────┐
│  AuthContext│ ─────────────────►│ dApp SDK   │
│             │                   │ (or demo)  │
└──────┬──────┘                   └──────┬─────┘
       │                                 │
       │◄────── party ID ────────────────┘
       │
       ▼
┌─────────────────┐
│ user = {        │
│   partyId,      │
│   isConnected   │
│ }               │
└─────────────────┘
```

## Data Flow

### Name Search Flow

```
User Input → useNameAvailability hook → debounce → validateName()
                                                       │
                                                       ▼
                                              adapter.checkAvailability()
                                                       │
                           ┌───────────────────────────┼───────────────────────────┐
                           ▼                           ▼                           ▼
                     { status: 'available' }   { status: 'taken' }    { status: 'invalid' }
                           │                           │                           │
                           └───────────────────────────┼───────────────────────────┘
                                                       │
                                                       ▼
                                              Update UI State
```

### Registration Flow

```
1. User enters name on home page
   └─► Checks availability
   └─► Click "Register" → /register?name=xyz

2. /register page loads
   └─► Creates RegistrationManager
   └─► Validates name, shows fee info

3. User connects wallet (if not connected)
   └─► AuthContext.connect()
   └─► Demo: simulates connection
   └─► Live: dApp SDK wallet picker

4. User submits registration
   └─► registrationAdapter.requestRegistration()
   └─► Returns subscriptionRequestCid

5. Wallet approval
   └─► Demo: click "Approve Payment" button
   └─► Live: user approves in wallet app

6. Payment processing
   └─► Demo: simulated delay
   └─► Live: DSO automation processes

7. Confirmation
   └─► Poll Scan API for entry
   └─► Entry found → confirmed state
```

## Security Considerations

### Server-Side Authorization

- JWT tokens required for ANS API calls
- Tokens validated server-side
- Party ID from JWT subject, not client input

### Client-Side Safety

- No bearer tokens in localStorage
- Session data minimal (isDemo flag only)
- Wallet redirects treated as navigation, not proof
- Final state confirmed via Scan API

### Input Validation

- Name validation with Zod schemas
- URL validation (max 255 chars)
- Description validation (max 140 chars)
- Reserved names blocked

## API Integration Points

### Scan API (Public, No Auth)

| Endpoint | Purpose |
|----------|---------|
| `GET /v0/ans-entries?name_prefix=&page_size=` | Search names |
| `GET /v0/ans-entries/by-name/{name}` | Exact lookup |
| `GET /v0/ans-entries/by-party/{party}` | Reverse lookup |

### ANS API (Requires Auth)

| Endpoint | Purpose |
|----------|---------|
| `POST /v0/entry/create` | Request registration |
| `GET /v0/entry/all` | List user's names |

## Testing Strategy

### Unit Tests (Vitest)

- Name validation logic
- Registration state machine transitions
- Demo fixture data

### Integration Tests (Future)

- Adapter API calls
- React Query caching
- Component interactions

### E2E Tests (Playwright, Future)

- Demo search → register flow
- Rejected approval flow
- Name details with QR code

## Future Improvements

### Not Implemented (Marked in Code)

- Live wallet integration (@canton-network/dapp-sdk)
- Renewal management
- Transfer names
- Auto-renewal settings
- Profile URL fetching/display
- Push notifications for expiration

### Extraction Candidates

- `CnsRecipientInput` as npm package
- Adapter layer as standalone SDK
- Name validation utilities
