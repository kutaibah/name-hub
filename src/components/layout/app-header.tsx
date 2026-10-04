'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/cns/auth-context';
import { getNetworkName, isDemoMode } from '@/lib/cns/config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app', label: 'Search', icon: Search },
  { href: '/app/names', label: 'My Names', requireAuth: true },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, isConnecting, connect, disconnect } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDemo = isDemoMode();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-sm text-amber-800">
          <span className="font-medium">Demo mode</span> — simulated data and payments
        </div>
      )}
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/app" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Canton Names"
                width={36}
                height={36}
                className="h-9 w-9"
                priority
              />
              <span className="hidden sm:block font-semibold text-lg text-gray-900">Canton Names</span>
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
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/app/demo/recipient"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === '/app/demo/recipient'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                Integration Demo
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex text-xs border-gray-300 text-gray-600">
              {getNetworkName()}
            </Badge>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm text-gray-600">
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
          <nav className="md:hidden py-4 border-t border-gray-100 bg-white">
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
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/app/demo/recipient"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === '/app/demo/recipient'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                Integration Demo
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                {getNetworkName()}
              </Badge>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
