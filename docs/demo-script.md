# Canton Names - Demo Script

**Duration**: 3 minutes

## Setup

1. Start the app: `pnpm dev`
2. Open http://localhost:3847
3. Ensure Demo Controls panel is visible (bottom-right)
4. Set scenario to "Success"

---

## Demo Flow (3 minutes)

### Introduction (30 seconds)

> "Canton Names lets users register readable names for their Canton Network identities. Instead of sharing long party IDs like 'auth0_007c...' you can share 'alice.unverified.cns'."

Show the home page:
- Clean landing with search focus
- Visible network badge (DevNet - Demo)
- Demo mode banner

### Search & Availability (45 seconds)

1. Type "my-new-name" in search
   > "The system validates names in real-time..."
   
2. Show the canonical name preview
   > "Names always end with '.unverified.cns' - this indicates anyone can register without identity verification"

3. Click "Register Name"
   > "If available, we start the registration flow"

### Registration Flow (60 seconds)

1. **Connect Wallet**
   > "First, connect your Canton wallet"
   - Click "Connect Wallet"
   - (Demo simulates connection)
   
2. **Submit Request**
   > "Add optional metadata - a URL and description"
   - Leave defaults or add sample URL
   - Click "Submit Request"
   
3. **Wallet Approval**
   > "In production, you'd approve this in your Canton wallet. In demo mode, we simulate it."
   - Click "Approve Payment"
   
4. **Confirmation**
   > "The system waits for on-chain confirmation..."
   - Show progress states
   - "Success! The name is now registered."

5. Click "View Name Details"

### Name Details (30 seconds)

> "Each name has a shareable page with:"

- Full canonical name
- Owner's party ID (click to copy)
- QR code for easy sharing
- Expiration date
- Link to copy/share

> "The 'unverified' label reminds users this isn't identity verification"

### Integration Demo (30 seconds)

Navigate to Integration Demo (`/demo/recipient`)

> "For developers, we provide a reusable component"

1. Type "alice" in the recipient input
2. Show the resolution
3. Click "Select"

> "This component handles debouncing, validation, and error states. It's designed to drop into any Canton app."

### My Names (15 seconds)

Navigate to My Names (`/names`)

> "Users can view all their registered names, see expiration dates, and manage renewals through their wallet."

---

## Key Points to Emphasize

1. **User Experience**: Simple flow from search to registration
2. **Transparency**: Clear "unverified" labeling
3. **Developer Friendly**: Reusable resolver component
4. **Canton Integration**: Built on CNS/ANS standards

## Handling Questions

**Q: What does "unverified" mean?**
> Names aren't tied to real-world identity. Anyone with Canton Coin can register.

**Q: How much does registration cost?**
> Configured by the network (typically 1 CC). Shown before confirming.

**Q: Can names expire?**
> Yes, entries need renewal. Wallets can auto-renew if enabled.

**Q: Is this production-ready?**
> This is a hackathon MVP. Live mode requires wallet SDK integration and validator access.
