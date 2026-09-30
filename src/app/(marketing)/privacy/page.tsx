import { siteConfig, hasGitHubUrl } from '@/config/site';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Canton Names.',
};

export default function PrivacyPage() {
  const showGitHub = hasGitHubUrl();
  
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none text-gray-600">
        <p className="text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Overview</h2>
        <p>
          {siteConfig.name} is a demonstration application for the Canton Name Service (CNS).
          This privacy policy explains how we handle your information when you use our service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Information We Collect</h2>
        <p>
          When you use {siteConfig.name}, we may collect:
        </p>
        <ul className="space-y-2 mt-4">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            <span><strong className="text-gray-900">Wallet Information:</strong> Your Canton party ID when you connect your wallet.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            <span><strong className="text-gray-900">Registration Data:</strong> Names, URLs, and descriptions you submit during registration.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            <span><strong className="text-gray-900">Usage Data:</strong> Anonymous analytics about how you use the application.</span>
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Name Data</h2>
        <p>
          Name registrations are stored via the Canton Name Service and are publicly accessible.
          This includes your party ID, registered names, and associated metadata.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Demo Mode</h2>
        <p>
          When using demo mode, all data is simulated and stored locally in your browser.
          No real transactions occur and no data is sent to external servers.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">Contact</h2>
        <p>
          For questions about this privacy policy
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
