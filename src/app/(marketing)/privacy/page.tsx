import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Canton Names.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none text-muted-foreground">
        <p className="text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Overview</h2>
        <p>
          {siteConfig.name} is a demonstration application for the Canton Name Service (CNS).
          This privacy policy explains how we handle your information when you use our service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Information We Collect</h2>
        <p>
          When you use {siteConfig.name}, we may collect:
        </p>
        <ul className="space-y-2 mt-4">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <strong className="text-foreground">Wallet Information:</strong> Your Canton party ID when you connect your wallet.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <strong className="text-foreground">Registration Data:</strong> Names, URLs, and descriptions you submit during registration.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <strong className="text-foreground">Usage Data:</strong> Anonymous analytics about how you use the application.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">On-Chain Data</h2>
        <p>
          Name registrations are stored on the Canton Network and are publicly accessible.
          This includes your party ID, registered names, and associated metadata.
          This data cannot be deleted once registered.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Demo Mode</h2>
        <p>
          When using demo mode, all data is simulated and stored locally in your browser.
          No real transactions occur and no data is sent to external servers.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Contact</h2>
        <p>
          For questions about this privacy policy, please open an issue on our{' '}
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub repository
          </a>
          .
        </p>
      </div>
    </div>
  );
}
