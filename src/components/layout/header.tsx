'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/cns/auth-context';
import { getNetworkName, isDemoMode } from '@/lib/cns/config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Search', icon: Search },
  { href: '/names', label: 'My Names', requireAuth: true },
];

export function Header() {
  const pathname = usePathname();
  const { user, isConnecting, connect, disconnect } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDemo = isDemoMode();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {isDemo && (
        <div className="bg-warning/20 border-b border-warning/30 px-4 py-1.5 text-center text-sm text-warning-foreground">
          <span className="font-medium">Demo mode</span> — simulated data and payments
        </div>
      )}
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                CN
              </div>
              <span className="hidden sm:block font-semibold text-lg">Canton Names</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                if (item.requireAuth && !user) return null;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/demo/recipient"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === '/demo/recipient'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                Integration Demo
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex text-xs">
              {getNetworkName()}
            </Badge>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm text-muted-foreground">
                  {user.displayName || 'Connected'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => connect()}
                disabled={isConnecting}
                size="sm"
                className="gap-1.5"
              >
                <User className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-1">
              {navItems.map(item => {
                if (item.requireAuth && !user) return null;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/demo/recipient"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === '/demo/recipient'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                Integration Demo
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Badge variant="outline" className="text-xs">
                {getNetworkName()}
              </Badge>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
