import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export const metadata = {
  title: 'Canton Names - Readable Names for Canton Party IDs',
  description: 'Canton Names lets users and apps replace long, error-prone party IDs with simple names — so you always send to the right party.',
};

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-3">
                Naming layer for Canton
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                Readable names for Canton party IDs
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Canton Names lets users and apps replace long, error-prone party IDs with simple names — so you always send to the right party.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  View docs
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                <Link href="/app" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Open app →
                </Link>
              </p>
            </div>
            
            {/* Hero Visual - Party ID Resolution Mockup */}
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                  Recipient
                </p>
                
                {/* Before: Long Party ID */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">Before</span>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <code className="text-sm text-gray-600 font-mono break-all">
                      alice::1220a3f9b8c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1c7e2
                    </code>
                  </div>
                </div>
                
                {/* After: CNS Name */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">After</span>
                  </div>
                  <div className="rounded-lg border-2 border-indigo-500 bg-indigo-50/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-indigo-700 font-mono font-medium">
                        alice.unverified.cns
                      </code>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        <Check className="h-3 w-3" />
                        Resolved
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="mt-4 text-xs text-gray-500 text-center">
                  Names resolve automatically to party IDs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <BenefitItem text="Easy to remember" />
            <BenefitItem text="Harder to mistype" />
            <BenefitItem text="Routes correctly every time" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Built for simplicity
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Canton Names makes party identification straightforward for users and developers alike.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <FeatureCard
              title="Readable identities"
              description="Replace cryptographic party IDs with names people can actually read, share, and remember."
            />
            <FeatureCard
              title="Drop-in recipient field"
              description="Add name resolution to your app with a single component. Handles validation, lookup, and fallback automatically."
            />
            <FeatureCard
              title="Reliable routing"
              description="Names resolve to the correct party ID every time, reducing errors in payments and transfers."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps from name to transaction.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
            <StepCard
              number={1}
              title="Choose a name"
              description="Pick an available name that's easy to share and remember."
            />
            <StepCard
              number={2}
              title="Resolve automatically"
              description="When someone enters your name, it resolves to your party ID instantly."
            />
            <StepCard
              number={3}
              title="Send with confidence"
              description="Transactions route to the right party — no copy-paste errors."
            />
          </div>
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-8 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Make Canton party IDs readable
            </h2>
            <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto">
              Start using human-readable names for your Canton Network identity today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
              >
                Get started
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

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-center">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <Check className="h-3 w-3" />
      </div>
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
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
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
