# Canton Names Resolve API

Safe, typed name-to-party resolution for Canton Network applications.

> **Product doctrine:** "Lookup is the product. Registration is support. Safety is the differentiator."

## Quick Start

```typescript
import { getResolver, type ResolveResult } from '@/lib/cns';

const resolver = getResolver();
const result = await resolver.resolve('alice');

if (result.status === 'ok') {
  // Safe to use immediately
  sendTransfer(result.partyId);
} else if (result.requiresConfirmation) {
  // Show warning, require user confirmation
  showWarning(result.reasonCode);
} else if (result.blocking) {
  // Cannot proceed
  showError(result.reasonCode);
}
```

## Contract

### `resolve(input, opts?): Promise<ResolveResult>`

Resolves a CNS name or party ID to a usable party identifier.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `input` | `string` | CNS name (e.g., `alice`) or party ID (e.g., `alice::1220...`) |
| `opts.knownPartyId` | `string?` | Previous party ID to detect changes |
| `opts.lastKnown` | `LastKnownResolution?` | Full last-known resolution for change detection |
| `opts.signal` | `AbortSignal?` | Abort signal for cancellation |

**Input Detection:**
- Names: Normalized to lowercase with `.unverified.cns` suffix
- Party IDs: Detected by pattern `identifier::hex64+`

### ResolveResult

Discriminated union on `status`:

```typescript
type ResolveResult =
  | OkResult        // Safe to use immediately
  | MissingResult   // Name/party not found or invalid
  | ExpiredResult   // Name has expired
  | UnverifiedResult // Not identity-verified, requires confirmation
  | ChangedResult;  // Party ID changed, requires confirmation
```

**Common Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | `'ok' \| 'missing' \| 'expired' \| 'unverified' \| 'changed'` | Resolution outcome |
| `partyId` | `string \| null` | Resolved party ID (null when blocked) |
| `reasonCode` | `ReasonCode` | Machine-readable code for programmatic handling |
| `requiresConfirmation` | `boolean` | True only for `unverified` and `changed` |
| `blocking` | `boolean` | True for `missing` and `expired` |
| `input` | `ResolveInput` | Parsed input (raw, normalized, kind) |
| `name` | `string \| null` | Canonical name if resolved |
| `verified` | `boolean` | Whether identity is verified |
| `expiresAt` | `string \| null` | ISO expiration timestamp |
| `previousPartyId` | `string \| null` | For `changed` status only |
| `resolvedAt` | `string` | ISO timestamp of resolution |
| `source` | `'demo' \| 'live'` | Resolver mode |

## Status Table

| Status | `partyId` | `requiresConfirmation` | `blocking` | UI Behavior |
|--------|-----------|------------------------|------------|-------------|
| `ok` | ✓ present | `false` | `false` | Usable immediately |
| `unverified` | ✓ present | `true` | `false` | Show warning, require confirmation |
| `changed` | ✓ present | `true` | `false` | Show warning with old/new, require confirmation |
| `expired` | `null` | `false` | `true` | Show error, disable submit |
| `missing` | `null` | `false` | `true` | Show error, disable submit |

## Reason Codes

| Code | Status | Description |
|------|--------|-------------|
| `OK` | `ok` | Name resolved successfully |
| `INVALID_INPUT` | `missing` | Invalid name or party ID format |
| `NAME_NOT_FOUND` | `missing` | Name does not exist |
| `PARTY_NOT_FOUND` | `missing` | Party ID not registered |
| `NAME_EXPIRED` | `expired` | Name registration has expired |
| `NAME_UNVERIFIED` | `unverified` | Name is not identity-verified |
| `PARTY_CHANGED_SINCE_LAST_RESOLUTION` | `changed` | Party ID differs from last known |
| `RESOLVER_UNAVAILABLE` | `missing` | Network or service error |

**Design notes:**
- `INVALID_INPUT` and `RESOLVER_UNAVAILABLE` intentionally map to status `missing` because the outcome is the same: no usable party ID can be returned. The reason code distinguishes the cause for logging and user messaging.
- The `blocking` field determines whether submission should be disabled, not `status` alone. Both `missing` and `expired` have `blocking: true`, while `unverified` and `changed` have `blocking: false` (they allow submission after confirmation).
- An `ambiguous` status was intentionally omitted. Names resolve to exactly one party ID; if a lookup returns multiple candidates, the resolver treats it as an error (`RESOLVER_UNAVAILABLE`).

## Confirmation Rules

**Requires confirmation (`requiresConfirmation: true`):**
- `unverified`: User must acknowledge they're sending to an unverified identity
- `changed`: User must confirm the party ID change since last use

**Blocking (`blocking: true`):**
- `missing`: Invalid input, name not found, party not found, or resolver error
- `expired`: Name has expired and cannot be used

**Immediately usable:**
- `ok`: Verified names resolve without friction

## Change Detection

The resolver detects when a name's party ID has changed since last use:

1. **Caller-provided:** Pass `knownPartyId` or `lastKnown` in options
2. **Local cache:** Automatic localStorage cache keyed by normalized name

```typescript
// Manual change detection
const result = await resolver.resolve('alice', {
  knownPartyId: 'old-party::1220...',
});

if (result.status === 'changed') {
  console.log('New:', result.partyId);
  console.log('Previous:', result.previousPartyId);
}
```

## Component Integration

### CnsRecipientInput

Drop-in component with built-in safety:

```tsx
import { CnsRecipientInput } from '@/components/cns/cns-recipient-input';

function TransferForm() {
  const [usablePartyId, setUsablePartyId] = useState<string | null>(null);

  return (
    <form>
      <CnsRecipientInput
        label="Recipient"
        onResolve={(result) => console.log(result)}
        onChange={({ partyId }) => setUsablePartyId(partyId)}
      />
      
      <button type="submit" disabled={!usablePartyId}>
        Send
      </button>
    </form>
  );
}
```

**Callbacks:**

| Callback | Signature | Description |
|----------|-----------|-------------|
| `onResolve` | `(result: ResolveResult) => void` | Called on every resolution |
| `onChange` | `({ partyId, result, confirmed }) => void` | Called when usable party changes |

**Behavior:**
- `partyId` is only set when safe to use (OK or confirmed)
- Confirmation checkbox appears for `unverified`/`changed`
- Confirmation resets if input changes
- Blocked states (`missing`/`expired`) never emit a usable party

## Demo Mode

Demo mode includes seeded entries for all states:

| Name | Full Name | Status | Description |
|------|-----------|--------|-------------|
| `alice` | `alice.unverified.cns` | `unverified` | Standard unverified name |
| `bob` | `bob.unverified.cns` | `unverified` | Another unverified name |
| `bank` | `bank.cns` | `ok` | Verified identity |
| `expired-name` | `expired-name.unverified.cns` | `expired` | Expired name |
| `changed-party` | `changed-party.unverified.cns` | `changed` | Party ID changed |
| `nonexistent` | N/A | `missing` | Name not found |

**Naming convention:**
- Verified names use the `.cns` suffix (e.g., `bank.cns`)
- Unverified names use the `.unverified.cns` suffix (e.g., `alice.unverified.cns`)
- When you type just the base name (e.g., `bank`), the resolver checks for both verified and unverified variants

## Zod Schemas

All types have corresponding Zod schemas for runtime validation:

```typescript
import {
  ResolveResultSchema,
  ReasonCodeSchema,
  ResolveStatusSchema,
  ResolveInputSchema,
} from '@/lib/cns';

// Validate a result
const validated = ResolveResultSchema.parse(result);
```
