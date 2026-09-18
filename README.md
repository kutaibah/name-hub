# Canton Names

A web client for searching, registering, managing, and resolving Canton Name Service (CNS) names on the Canton Network.

**Hackathon MVP** for AppsFactory Open Track.

## What is Canton Names?

Canton Names helps Canton Network users replace hard-to-share party identifiers with readable names. Instead of sharing `auth0_007c675a429eaf831f0991308d85::12201abe669f...`, you can share `alice.unverified.cns`.

## Features

- **Search**: Find available names with real-time availability checking
- **Register**: Multi-step registration flow with wallet integration
- **Manage**: View your registered names and their status
- **Share**: Shareable links and QR codes for name details
- **Resolve**: Reusable `CnsRecipientInput` component for integration

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd canton-names

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app runs at [http://localhost:3847](http://localhost:3847).

### Demo Mode

By default, the app runs in **demo mode** with simulated data. This allows you to explore all features without connecting to the Canton Network.

Demo names available:
- `alice.unverified.cns`
- `bob.unverified.cns`
- `canton-dev.unverified.cns`

Use the Demo Controls panel (bottom-right) to test different registration scenarios.

### Live Mode

To connect to a real Canton Network:

1. Create `.env.local`:
```env
NEXT_PUBLIC_CNS_MODE=live
NEXT_PUBLIC_SCAN_API_URL=https://scan.sv-1.global.canton.network.sync.global/api/scan
NEXT_PUBLIC_VALIDATOR_API_URL=<your-validator-url>
NEXT_PUBLIC_NETWORK_NAME=DevNet
```

2. Ensure you have:
   - A Canton wallet with Canton Coin
   - Access to a Validator App with ANS API

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run Vitest tests |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home / Search
│   ├── register/           # Registration flow
│   ├── names/              # My Names list
│   ├── name/[name]/        # Name details
│   └── demo/recipient/     # Integration showcase
├── components/
│   ├── cns/                # CNS-specific components
│   │   ├── name-search.tsx
│   │   ├── cns-recipient-input.tsx
│   │   ├── registration-flow.tsx
│   │   ├── name-details.tsx
│   │   └── ...
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── cns/                # CNS core logic
│   │   ├── types.ts        # Types and validation
│   │   ├── adapter.ts      # Live/demo adapters
│   │   ├── config.ts       # Environment config
│   │   └── ...
│   └── hooks/              # React hooks
└── __tests__/              # Vitest tests
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Integration

The `CnsRecipientInput` component is designed for reuse in other Canton applications:

```tsx
import { CnsRecipientInput } from '@/components/cns/cns-recipient-input';

<CnsRecipientInput
  label="Recipient"
  description="Enter a CNS name"
  onSelect={(resolved) => {
    console.log('Party ID:', resolved.partyId);
  }}
/>
```

See the Integration Demo at `/demo/recipient` for a live example.

## Documentation

- [Integration Findings](docs/integration-findings.md) - CNS API documentation
- [Architecture](docs/architecture.md) - System architecture
- [Demo Script](docs/demo-script.md) - 3-minute demo walkthrough
- [Hackathon Brief](docs/hackathon-brief.md) - Problem, solution, value proposition
- [Pilot Plan](docs/pilot-plan.md) - Post-hackathon deployment plan

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query
- **Validation**: Zod
- **Testing**: Vitest

## License

MIT

## Disclaimer

This is a hackathon MVP. Canton Names is not affiliated with Digital Asset, Canton Network, or the Decentralized Synchronizer Operator (DSO).

"Unverified" names indicate that no identity verification was performed. Anyone with Canton Coin can register any available name.
