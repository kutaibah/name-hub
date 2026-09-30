import { siteConfig, hasGitHubUrl } from '@/config/site';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Canton Names.',
};

export default function TermsPage() {
  const showGitHub = hasGitHubUrl();
  
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray max-w-none text-gray-600">
        <p className="text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Acceptance of Terms</h2>
        <p>
          By using {siteConfig.name}, you agree to these terms of service.
          If you do not agree, please do not use the application.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Description of Service</h2>
        <p>
          {siteConfig.name} is a demonstration web client for the Canton Name Service (CNS),
          allowing users to search, register, and manage human-readable names on Canton Network.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Unverified Names</h2>
        <p>
          All user-registered names include the <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800">.unverified.cns</code> suffix.
          This indicates that no real-world identity verification has been performed.
          Anyone with sufficient Canton Coin can register any available name.
        </p>
        <p className="mt-4">
          <strong className="text-gray-900">You should not rely on a name as proof of identity.</strong>{' '}
          Always verify the party ID through independent channels for high-value transactions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">No Warranty</h2>
        <p>
          This is a hackathon demonstration project provided &quot;as is&quot; without warranty of any kind.
          We make no guarantees about availability, accuracy, or fitness for any purpose.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Limitation of Liability</h2>
        <p>
          We are not responsible for any losses arising from:
        </p>
        <ul className="space-y-2 mt-4">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            Incorrect name resolution or registration failures
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            Loss of Canton Coin or other assets
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            Service interruptions or data loss
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            Reliance on unverified names for identity
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Not Affiliated</h2>
        <p>
          {siteConfig.name} is an independent project and is not affiliated with, endorsed by,
          or sponsored by Digital Asset Holdings, LLC or the Canton Network.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Changes to Terms</h2>
        <p>
          We may update these terms at any time. Continued use of the service after changes
          constitutes acceptance of the new terms.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Contact</h2>
        <p>
          For questions about these terms
          {showGitHub ? (
            <>
              , please open an issue on our{' '}
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                GitHub repository
              </a>
              .
            </>
          ) : (
            ', please reach out through the application.'
          )}
        </p>
      </div>
    </div>
  );
}
