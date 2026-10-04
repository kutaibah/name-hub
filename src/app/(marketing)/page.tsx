import Link from 'next/link';
import { ArrowRight, Check, Shield, Code, AlertTriangle, Ban, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Canton Names - Safe Recipient Resolution for Canton Apps',
  description: 'A drop-in recipient field and typed resolver that lets any Canton app accept readable names instead of party IDs, and warns or blocks before a transfer goes to the wrong party.',
};

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">
                For Canton app developers
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Safe recipient resolution for Canton apps
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                A drop-in recipient field and typed resolver that lets any Canton app accept readable names instead of party IDs — and warns or blocks before a transfer goes to the wrong party.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/app/demo/recipient"
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Try the demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  View docs
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/app/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline">
                  Register a name →
                </Link>
              </p>
            </div>
            
            {/* Hero Visual - CnsRecipientInput Mockup with Status Badge */}
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg shadow-gray-200/50 dark:shadow-none">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  CnsRecipientInput
                </p>
                
                {/* Resolved State */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🔍</span>
                    <code className="text-sm text-gray-700 dark:text-gray-200 font-mono">bank</code>
                  </div>
                </div>
                
                {/* Resolution Result */}
                <div className="rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm text-gray-800 dark:text-gray-200 font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                      bank.cns
                    </code>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                      <Check className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Name resolved successfully</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-mono mt-1">Party: acme-bank::...1234abcd</p>
                </div>
                
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Typed status codes • Blocks risky sends • Demo mode
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctrine Strip */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            <span className="text-indigo-600 dark:text-indigo-400">&ldquo;Lookup is the product.</span>{' '}
            Registration is support.{' '}
            <span className="text-indigo-600 dark:text-indigo-400">Safety is the differentiator.&rdquo;</span>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Built for Canton developers
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Frontend devs on Canton app teams moving value — wallets, payments, tokenization, custody.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Code className="h-6 w-6" />}
              title="Drop-in CnsRecipientInput"
              description="One React component with built-in resolution, validation, and confirmation flows. Handles all edge cases so you don't have to."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Typed resolve() contract"
              description="Discriminated union on status (ok, missing, expired, unverified, changed) with stable reason codes for programmatic handling."
            />
            <FeatureCard
              icon={<AlertTriangle className="h-6 w-6" />}
              title="Transfer safety"
              description="Blocks missing and expired names. Requires explicit confirmation for unverified or changed party IDs. Never sends to the wrong party."
            />
          </div>
        </div>
      </section>

      {/* Status Examples */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Every resolution state handled
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The resolver returns typed results so your app knows exactly what to do.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatusCard
              status="ok"
              badge="Verified"
              badgeColor="bg-green-600"
              description="Safe to use immediately"
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <StatusCard
              status="unverified"
              badge="Unverified"
              badgeColor="bg-amber-500"
              description="Requires user confirmation"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <StatusCard
              status="changed"
              badge="Changed"
              badgeColor="bg-orange-500"
              description="Party ID differs from last use"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <StatusCard
              status="expired / missing"
              badge="Blocked"
              badgeColor="bg-red-600"
              description="Cannot proceed"
              icon={<Ban className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three steps to safe recipient resolution.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
            <StepCard
              number={1}
              title="Install"
              description="npm install, import CnsRecipientInput or use the resolver directly."
            />
            <StepCard
              number={2}
              title="Drop in"
              description="Replace your party ID input with the component. It handles resolution, validation, and confirmation."
            />
            <StepCard
              number={3}
              title="Users send safely"
              description="Names resolve to party IDs. Risky sends are blocked or require confirmation. Done."
            />
          </div>
          
          <div className="mt-12 rounded-xl bg-slate-900 p-6 overflow-x-auto">
            <pre className="text-sm text-slate-100">
              <code>{`import { CnsRecipientInput } from '@/components/cns/cns-recipient-input';

function TransferForm() {
  const [usablePartyId, setUsablePartyId] = useState<string | null>(null);

  return (
    <form>
      <CnsRecipientInput
        label="Recipient"
        onChange={({ partyId }) => setUsablePartyId(partyId)}
      />
      <button disabled={!usablePartyId}>Send Transfer</button>
    </form>
  );
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-8 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Add safe recipient resolution to your Canton app
            </h2>
            <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto">
              Try the integration demo, check the docs, or register a name to test with.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app/demo/recipient"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
              >
                Integration demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-400 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
              >
                View docs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

function StatusCard({
  status,
  badge,
  badgeColor,
  description,
  icon,
}: {
  status: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <code className="text-xs text-gray-500 dark:text-gray-400">{status}</code>
        <span className={`inline-flex items-center gap-1 rounded-full ${badgeColor} px-2 py-0.5 text-xs font-medium text-white`}>
          {icon}
          {badge}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}
