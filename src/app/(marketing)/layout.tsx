import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                CN
              </div>
              <span className="font-semibold text-lg">{siteConfig.name}</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/app"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                App
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Docs
              </Link>
            </nav>
          </div>
          
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Launch App →
          </Link>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  CN
                </div>
                <span className="font-semibold">{siteConfig.name}</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Human-readable addresses for Canton Network.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/app" className="hover:text-foreground transition-colors">
                    App
                  </Link>
                </li>
                <li>
                  <Link href="/app/demo/recipient" className="hover:text-foreground transition-colors">
                    Integration Demo
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} {siteConfig.name}. Not affiliated with Digital Asset or Canton Network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
