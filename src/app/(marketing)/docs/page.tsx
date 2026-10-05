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

      {/* truncated - use file instead */}
    </div>
  );
}
