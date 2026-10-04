import Link from 'next/link';
import { ArrowRight, ExternalLink, Presentation, PlayCircle } from 'lucide-react';
import { siteConfig, hasGitHubUrl } from '@/config/site';

export const metadata = {
  title: 'Documentation - 5-Minute Quickstart',
  description: 'Integrate safe recipient resolution into your Canton app in 5 minutes.',
};

export default function DocsPage() {
  const showGitHub = hasGitHubUrl();
  
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">5-Minute Quickstart</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Safe Recipient Resolution</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Add name resolution to your Canton app with a drop-in component and typed resolver.
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            href="/app/demo/recipient"
            className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <PlayCircle className="mr-1.5 h-4 w-4" />
            Try the demo
          </Link>
          <Link
            href="/pitch"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            <Presentation className="mr-1.5 h-4 w-4" />
            View pitch deck
          </Link>
        </div>
      </div>

      {/* Step 1: Install */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">1. Install</h2>
        <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
          <pre className="text-sm text-slate-100">
            <code>{`npm install @canton-names/resolver
# or copy CnsRecipientInput from the demo`}</code>
          </pre>
        </div>
      </section>

      {/* Step 2: Integrate */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">2. Drop in the component</h2>
        <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto mb-4">
          <pre className="text-sm text-slate-100">
            <code>{`import { CnsRecipientInput } from '@/components/cns/cns-recipient-input';
import type { ResolveResult } from '@/lib/cns/resolve-contract';

function TransferForm() {
  const [usablePartyId, setUsablePartyId] = useState<string | null>(null);

  return (
    <form onSubmit={handleTransfer}>
      <CnsRecipientInput
        label="Recipient"
        description="Enter a CNS name or party ID"
        onResolve={(result: ResolveResult) => console.log(result)}
        onChange={({ partyId }) => setUsablePartyId(partyId)}
      />
      
      <button type="submit" disabled={!usablePartyId}>
        Send Transfer
      </button>
    </form>
  );
}`}</code>
          </pre>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-indigo-600 dark:text-indigo-400">partyId</code> callback 
          only fires when the resolution is safe to use — either OK status, or confirmed by the user.
        </p>
      </section>

      {/* Step 3: Or use the resolver directly */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">3. Or use the resolver directly</h2>
        <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto mb-4">
          <pre className="text-sm text-slate-100">
            <code>{`import { getResolver, type ResolveResult } from '@/lib/cns';

const resolver = getResolver();
const result: ResolveResult = await resolver.resolve('alice');

if (result.status === 'ok') {
  // Safe to use immediately
  sendTransfer(result.partyId);
} else if (result.requiresConfirmation) {
  // Show warning, wait for user confirmation
  showWarning(result.reasonCode);
} else if (result.blocking) {
  // Cannot proceed
  showError(result.reasonCode);
}`}</code>
          </pre>
        </div>
      </section>

      {/* Status Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Status Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">partyId</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">requiresConfirmation</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">blocking</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">UI Behavior</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4"><code className="text-green-600">ok</code></td>
                <td className="py-3 px-4">✓</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Usable immediately</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4"><code className="text-amber-600">unverified</code></td>
                <td className="py-3 px-4">✓</td>
                <td className="py-3 px-4 text-amber-600 font-medium">true</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Show warning, require confirmation</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4"><code className="text-orange-600">changed</code></td>
                <td className="py-3 px-4">✓</td>
                <td className="py-3 px-4 text-amber-600 font-medium">true</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Show warning with old/new, require confirmation</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-4"><code className="text-red-600">expired</code></td>
                <td className="py-3 px-4">null</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4 text-red-600 font-medium">true</td>
                <td className="py-3 px-4">Show error, disable submit</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="text-red-600">missing</code></td>
                <td className="py-3 px-4">null</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4 text-red-600 font-medium">true</td>
                <td className="py-3 px-4">Show error, disable submit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Reason Codes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Reason Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300 font-mono text-xs">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-4">OK</td>
                <td className="py-2 px-4">ok</td>
                <td className="py-2 px-4 font-sans text-sm">Name resolved successfully</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-4">INVALID_INPUT</td>
                <td className="py-2 px-4">missing</td>
                <td className="py-2 px-4 font-sans text-sm">Invalid name or party ID format</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-4">NAME_NOT_FOUND</td>
                <td className="py-2 px-4">missing</td>
                <td className="py-2 px-4 font-sans text-sm">Name does not exist</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-4">PARTY_NOT_FOUND</td>
                <td className="py-2 px-4">missing</td>
                <td className="py-2 px-4 font-sans text-sm">Party ID not registered</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-4">NAME_EXPIRED</td>
                <td className="py-2 px-4">expired</td>
                <td className="py-2 px-4 font-sans text-sm">Name registration has expired</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-4">NAME_UNVERIFIED</td>
                <td className="py-2 px-4">unverified</td>
                <td className="py-2 px-4 font-sans text-sm">Name is not identity-verified</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-4">PARTY_CHANGED_SINCE_LAST_RESOLUTION</td>
                <td className="py-2 px-4">changed</td>
                <td className="py-2 px-4 font-sans text-sm">Party ID differs from last known</td>
              </tr>
              <tr>
                <td className="py-2 px-4">RESOLVER_UNAVAILABLE</td>
                <td className="py-2 px-4">missing</td>
                <td className="py-2 px-4 font-sans text-sm">Network or service error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Confirmation & Blocking Rules */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Confirmation & Blocking Rules</h2>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mt-0 mb-2">Requires confirmation</h3>
            <ul className="text-sm text-amber-700 dark:text-amber-300 mb-0">
              <li><code>unverified</code>: User must acknowledge sending to an unverified identity</li>
              <li><code>changed</code>: User must confirm the party ID change since last use</li>
            </ul>
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mt-0 mb-2">Blocking (cannot proceed)</h3>
            <ul className="text-sm text-red-700 dark:text-red-300 mb-0">
              <li><code>missing</code>: Invalid input, name not found, party not found, or resolver error</li>
              <li><code>expired</code>: Name has expired and cannot be used</li>
            </ul>
          </div>
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mt-0 mb-2">Immediately usable</h3>
            <ul className="text-sm text-green-700 dark:text-green-300 mb-0">
              <li><code>ok</code>: Verified names resolve without friction</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Demo vs Live */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Demo vs Live Mode</h2>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Both demo and live resolvers share the same <code>ResolveResult</code> contract. The only differences:
          </p>
          <ul className="text-gray-600 dark:text-gray-300">
            <li><strong>Demo mode</strong>: Returns seeded entries for all statuses (alice, bob, bank, expired-name, changed-party)</li>
            <li><strong>Live mode</strong>: Calls the Scan API; returns <code>RESOLVER_UNAVAILABLE</code> (blocking) when the network is unreachable</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-300">
            This means you can develop and test against demo mode, then switch to live mode for production with zero code changes.
          </p>
        </div>
      </section>

      {/* Links */}
      <section className="grid gap-4 sm:grid-cols-2 mb-12">
        <Link
          href="/app/demo/recipient"
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Integration Demo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">See the component resolving all status types with a mock transfer form.</p>
          <span className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400">
            Try it
            <ArrowRight className="ml-1 h-3 w-3" />
          </span>
        </Link>
        <Link
          href="/pitch"
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pitch Deck</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">12-slide presentation covering problem, solution, and roadmap.</p>
          <span className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400">
            View deck
            <ArrowRight className="ml-1 h-3 w-3" />
          </span>
        </Link>
      </section>

      {showGitHub && (
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Check out the source code, open an issue, or contribute to the project.
          </p>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            View on GitHub
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </section>
      )}
    </div>
  );
}
