import Link from 'next/link';
import { siteConfig, hasGitHubUrl } from '@/config/site';
import { ArrowRight, ExternalLink, Book, Code, Terminal, Zap, Presentation } from 'lucide-react';

export const metadata = {
  title: 'Documentation',
  description: 'Learn how to integrate Canton Names into your application.',
};

export default function DocsPage() {
  const showGitHub = hasGitHubUrl();
  
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Documentation</h1>
        <p className="mt-4 text-lg text-gray-600">
          Everything you need to integrate Canton Names into your Canton Network application.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-12">
        <DocCard
          icon={<Book className="h-6 w-6" />}
          title="Quick Start"
          description="Get up and running with Canton Names in minutes."
          href="/app"
          linkText="Try the App"
        />
        <DocCard
          icon={<Code className="h-6 w-6" />}
          title="Integration Guide"
          description="Add the CnsRecipientInput component to your app."
          href="/app/demo/recipient"
          linkText="View Demo"
        />
        <DocCard
          icon={<Terminal className="h-6 w-6" />}
          title="API Reference"
          description="Explore the Scan API for name resolution."
          href="/app/demo/recipient"
          linkText="View API Usage"
        />
        <DocCard
          icon={<Zap className="h-6 w-6" />}
          title="Examples"
          description="See real-world integration patterns."
          href="/app/demo/recipient"
          linkText="Browse Examples"
        />
        <DocCard
          icon={<Presentation className="h-6 w-6" />}
          title="Pitch Deck"
          description="12-slide presentation covering problem, solution, and roadmap."
          href="/pitch"
          linkText="View Pitch Deck"
        />
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Understanding CNS Names</h2>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600">
            Canton Names (CNS) provides human-readable aliases for Canton Network party IDs.
            All user-registered names include the <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800">.unverified.cns</code> suffix
            to indicate they have not undergone real-world identity verification.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Name Format</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              Names are 3-60 characters, lowercase alphanumeric with hyphens
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              Must start and end with a letter or number
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              No consecutive hyphens allowed
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              Example: <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800">alice.unverified.cns</code>
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Resolution</h3>
          <p className="text-gray-600">
            Names can be resolved to party IDs using the public Scan API. No authentication
            is required for lookups—anyone can resolve any name.
          </p>

          <div className="mt-4 rounded-xl bg-slate-900 p-4 overflow-x-auto">
            <pre className="text-sm text-slate-100">
              <code>{`GET /api/scan/v0/ans-entries/by-name/{name}

Response:
{
  "name": "alice.unverified.cns",
  "party_id": "::1220abc...",
  "expires_at": "2025-12-31T23:59:59Z"
}`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Registration</h3>
          <p className="text-gray-600">
            To register a name, users must connect a Canton wallet and pay a small
            Canton Coin fee. The registration process involves:
          </p>
          <ol className="space-y-2 text-gray-600 list-decimal list-inside mt-4">
            <li>Submitting a registration request via the ANS API</li>
            <li>Approving a subscription payment in your wallet</li>
            <li>Waiting for DSO automation to confirm the entry</li>
          </ol>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Integration Component</h2>
        
        <p className="text-gray-600 mb-6">
          The <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800">CnsRecipientInput</code> component
          provides a drop-in recipient field with name resolution, validation, and party ID fallback.
        </p>

        <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto mb-6">
          <pre className="text-sm text-slate-100">
            <code>{`import { CnsRecipientInput } from '@/components/cns/cns-recipient-input';

function PaymentForm() {
  const [recipient, setRecipient] = useState<{
    partyId: string;
    displayName: string;
  } | null>(null);

  return (
    <CnsRecipientInput
      onResolved={(partyId, name) => setRecipient({
        partyId,
        displayName: name || partyId.slice(0, 16) + '...'
      })}
      onCleared={() => setRecipient(null)}
    />
  );
}`}</code>
          </pre>
        </div>

        <Link
          href="/app/demo/recipient"
          className="inline-flex items-center text-indigo-600 hover:underline"
        >
          See the component in action
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </section>

      {showGitHub && (
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
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

function DocCard({
  icon,
  title,
  description,
  href,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center text-sm text-indigo-600 hover:underline"
      >
        {linkText}
        <ArrowRight className="ml-1 h-3 w-3" />
      </Link>
    </div>
  );
}
