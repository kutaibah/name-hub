import type { Metadata } from 'next';
import { ProductOverview } from '@/components/marketing/product-overview';
import { siteConfig } from '@/config/site';

const title = 'Canton Names — Safe recipient resolution for Canton apps';
const description =
  'Explain the problem, see the resolver approach, and try the demo. Drop-in CnsRecipientInput and resolve() for safer Canton transfers.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteConfig.url}/pitch` },
  openGraph: {
    type: 'website',
    url: `${siteConfig.url}/pitch`,
    siteName: siteConfig.name,
    title,
    description,
    images: [
      {
        url: `${siteConfig.url}/apple-icon.png`,
        width: 180,
        height: 180,
        alt: 'Canton Names logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title,
    description,
    images: [`${siteConfig.url}/apple-icon.png`],
  },
};

export default function PitchMarketingPage() {
  return <ProductOverview />;
}
