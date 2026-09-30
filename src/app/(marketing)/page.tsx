import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { 
  ShieldCheck, 
  Globe, 
  Link as LinkIcon, 
  Zap,
  ArrowRight,
  Search,
  Wallet,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const metadata = {
  title: 'Canton Names - Human-Readable Addresses for Canton Network',
  description: 'Replace complex party IDs with memorable names like alice.unverified.cns. Easy to share, easy to remember.',
};

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Human-readable addresses for{' '}
              <span className="text-primary">Canton Network</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Replace complex party IDs with memorable names like{' '}
              <code className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono text-base">
                alice.unverified.cns
              </code>
              . Easy to share, easy to remember.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Register a Name
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="No More Copy-Paste Errors"
              description="Send payments to alice.unverified.cns instead of a 66-character hex string."
            />
            <BenefitCard
              icon={<Globe className="h-6 w-6" />}
              title="Universal"
              description="Works across any app connected to Canton Network."
            />
            <BenefitCard
              icon={<LinkIcon className="h-6 w-6" />}
              title="On-Chain"
              description="Names resolve via the public Scan API—no centralized lookup."
            />
            <BenefitCard
              icon={<Zap className="h-6 w-6" />}
              title="Open Standard"
              description="Integrate the <CnsRecipientInput> component in minutes."
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Built for developers
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Add Canton Names resolution to your app with a single component.
              </p>
              
              <div className="mt-8 rounded-xl bg-slate-900 p-4 overflow-x-auto">
                <pre className="text-sm text-slate-100">
                  <code>{`import { CnsRecipientInput } from "@canton/names";

<CnsRecipientInput
  onResolved={(partyId) => setRecipient(partyId)}
/>`}</code>
                </pre>
              </div>
              
              <ul className="mt-8 space-y-4">
                <FeatureItem>Instant availability checks</FeatureItem>
                <FeatureItem>Auto-complete suggestions</FeatureItem>
                <FeatureItem>Party-ID fallback for advanced users</FeatureItem>
                <FeatureItem>Accessible and keyboard-navigable</FeatureItem>
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/60 shadow-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
                    <Search className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-medium">Integration Demo</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    See it in action at{' '}
                    <Link href="/app/demo/recipient" className="text-primary hover:underline">
                      /app/demo/recipient
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Register your name in minutes, use it everywhere on Canton.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number={1}
              icon={<Search className="h-6 w-6" />}
              title="Search"
              description="Check availability instantly"
            />
            <StepCard
              number={2}
              icon={<Wallet className="h-6 w-6" />}
              title="Connect"
              description="Link your Canton wallet"
            />
            <StepCard
              number={3}
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Pay"
              description="Approve a small CC fee"
            />
            <StepCard
              number={4}
              icon={<Share2 className="h-6 w-6" />}
              title="Share"
              description="Use your name anywhere"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border/60 p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to simplify payments?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Register your Canton Name today and make your identity memorable.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <span className="text-muted-foreground">{children}</span>
    </li>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background border-2 border-primary text-primary mb-4 relative">
        {icon}
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {number}
        </span>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
