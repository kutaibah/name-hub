'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { siteConfig, hasGitHubUrl } from '@/config/site';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showGitHub = hasGitHubUrl();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Canton Names"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
              <span className="font-semibold text-gray-900">{siteConfig.name}</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/#demo"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Demo
              </Link>
              <Link
                href="/#quickstart"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Quickstart
              </Link>
              <Link
                href="/pitch"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Overview
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Docs
              </Link>
              <Link
                href="/app"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                App
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="hidden md:inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Install
            </Link>
            
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="flex flex-col px-4 py-4 space-y-3">
              <Link
                href="/#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Demo
              </Link>
              <Link
                href="/#quickstart"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Quickstart
              </Link>
              <Link
                href="/pitch"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Overview
              </Link>
              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Docs
              </Link>
              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
              >
                Install
              </Link>
            </nav>
          </div>
        )}
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Canton Names"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <span className="font-semibold text-gray-900">{siteConfig.name}</span>
              </Link>
              <p className="mt-2 text-sm text-gray-500 max-w-xs">
                Safe recipient resolution for Canton app developers.
              </p>
            </div>
            
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <Link href="/pitch" className="text-gray-600 hover:text-gray-900">
                Overview
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                Docs
              </Link>
              <Link href="/app" className="text-gray-600 hover:text-gray-900">
                Get started
              </Link>
              <Link href="/app" className="text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              {showGitHub && (
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  GitHub
                </a>
              )}
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                Terms
              </Link>
            </nav>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} {siteConfig.name}. Not affiliated with Digital Asset or Canton Network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
