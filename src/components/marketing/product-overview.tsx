import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, ExternalLink, Shield, Zap, Wrench } from 'lucide-react';
import { PRODUCT_PROOF } from '@/config/product-proof';

const PARTY_ID_EXAMPLE =
  'auth0_007c675a429eaf831f0991308d85::12201abe669f8c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7';

const STATUSES = [
  { status: 'ok', action: 'Use immediately', tone: 'text-green-700 bg-green-50 border-green-200' },
  { status: 'unverified', action: 'Confirm before send', tone: 'text-amber-800 bg-amber-50 border-amber-200' },
  { status: 'changed', action: 'Confirm party ID change', tone: 'text-orange-800 bg-orange-50 border-orange-200' },
  { status: 'expired', action: 'Blocked', tone: 'text-red-800 bg-red-50 border-red-200' },
  { status: 'missing', action: 'Blocked', tone: 'text-red-800 bg-red-50 border-red-200' },
] as const;

const REASON_CODES = [
  'OK',
  'NAME_UNVERIFIED',
  'PARTY_CHANGED_SINCE_LAST_RESOLUTION',
  'NAME_EXPIRED',
  'NAME_NOT_FOUND',
  'INVALID_INPUT',
  'RESOLVER_UNAVAILABLE',
] as const;

export function ProductOverview() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-indigo-50/70 via-violet-50/30 to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo.svg" alt="" width={48} height={48} className="h-12 w-12" priority />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Safe recipient resolution for Canton apps
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A drop-in component and typed resolver so your users send to readable names—not pasted party IDs—
            with confirm-before-send only when resolution is risky.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/#demo"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Try the resolver
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900">The problem</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Canton transfers target opaque party IDs. They are hard to read, impossible to verify at a glance,
            and easy to mistype—one wrong character can fail the transfer or send value to the wrong party.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-red-700 mb-2">Party ID (paste risk)</p>
              <code className="block text-xs sm:text-sm text-red-900 break-all font-mono leading-relaxed">
                {PARTY_ID_EXAMPLE}
              </code>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-700 mb-2">Readable recipient</p>
              <code className="block text-lg font-mono font-semibold text-indigo-900">bank.cns</code>
              <p className="mt-2 text-sm text-indigo-800/80">Humans choose names; your app still sends to the resolved party ID.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="border-b border-gray-100 bg-gray-50/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900">The solution</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            <code className="text-sm bg-white px-1 rounded border border-gray-200">@canton-names/resolver</code>{' '}
            ships <code className="text-sm">CnsRecipientInput</code> (React) and headless{' '}
            <code className="text-sm">resolve()</code>. Both return the same contract:{' '}
            <code className="text-sm">status</code>, <code className="text-sm">reasonCode</code>, and{' '}
            <code className="text-sm">partyId</code> when applicable.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {STATUSES.map(({ status, action, tone }) => (
              <span
                key={status}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${tone}`}
              >
                <code className="font-semibold">{status}</code>
                <span className="text-gray-600">— {action}</span>
              </span>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Stable reason codes include{' '}
            {REASON_CODES.map((code, i) => (
              <span key={code}>
                <code className="text-xs bg-white px-1 rounded border border-gray-200">{code}</code>
                {i < REASON_CODES.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>

          <p className="mt-4 text-sm text-gray-600">
            Imports: <code className="text-xs">@canton-names/resolver</code>,{' '}
            <code className="text-xs">@canton-names/resolver/react</code>,{' '}
            <code className="text-xs">@canton-names/resolver/styles.css</code>.
          </p>
        </div>
      </section>

      {/* Why it matters */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900">Why it matters</h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            <li className="rounded-xl border border-gray-200 bg-white p-5">
              <Shield className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900">Safer transfers</h3>
              <p className="mt-2 text-sm text-gray-600">
                Missing and expired names block sends; unverified and changed resolutions require explicit confirmation.
              </p>
            </li>
            <li className="rounded-xl border border-gray-200 bg-white p-5">
              <Wrench className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900">Less custom logic</h3>
              <p className="mt-2 text-sm text-gray-600">
                One component handles debounce, badges, and confirm flows instead of reimplementing CNS edge cases.
              </p>
            </li>
            <li className="rounded-xl border border-gray-200 bg-white p-5">
              <Zap className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900">Faster integration</h3>
              <p className="mt-2 text-sm text-gray-600">
                Demo mode works without Canton credentials; switch to live Scan API config when you deploy.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Proof */}
      <section className="border-b border-gray-100 bg-gray-50/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900">What exists today</h2>
          <ul className="mt-6 space-y-3">
            {[
              'Interactive resolver demo on the developer homepage (demo fixtures, no live network required).',
              'Working Next.js prototype with integration demo at /app/demo/recipient.',
              `${PRODUCT_PROOF.totalTests} automated tests (${PRODUCT_PROOF.resolverTests} in the resolver package, ${PRODUCT_PROOF.appTests} in the app).`,
              'Production build passes in CI; package published on npm.',
              'Open source monorepo with resolver source in packages/resolver.',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-600 leading-relaxed">
            This is honest MVP scope: the resolver and UI run on <strong>demo data</strong> by default. Live Scan
            resolution is supported in the package, but <strong>live-network name registration is not production-ready</strong>{' '}
            yet—pilots should plan on demo mode or controlled live config.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <a
              href={`https://www.npmjs.com/package/${PRODUCT_PROOF.npmPackage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-600 hover:underline"
            >
              {PRODUCT_PROOF.npmPackage}@{PRODUCT_PROOF.npmVersion}
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
            <a
              href={PRODUCT_PROOF.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-600 hover:underline"
            >
              GitHub repository
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-16">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-10 sm:px-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Build safer Canton transfers</h2>
            <p className="mt-3 text-indigo-100 text-sm sm:text-base max-w-lg mx-auto">
              Try the live demo, read the quickstart, or open a pilot issue on GitHub.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#demo"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
              >
                Try the resolver
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-300 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500/30"
              >
                Read the docs
              </Link>
              <a
                href={PRODUCT_PROOF.pilotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-300 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500/30"
              >
                Pilot with us
                <ExternalLink className="ml-1.5 h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-indigo-200">
              Pilot requests open a GitHub issue—you can replace this with a contact form when ready.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
