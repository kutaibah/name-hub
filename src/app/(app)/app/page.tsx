'use client';

import { NameSearch } from '@/components/cns/name-search';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNetworkName, isDemoMode } from '@/lib/cns/config';
import { CNS_SUFFIX } from '@/lib/cns/types';
import { Shield, Zap, Globe, Search } from 'lucide-react';

export default function AppHomePage() {
  const isDemo = isDemoMode();

  return (
    <div className="min-h-[calc(100vh-16rem)]">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-4 border-gray-300 text-gray-600">
            {getNetworkName()}
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gray-900">
            Human-Readable Names for{' '}
            <span className="text-indigo-600">Canton Network</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Replace long party identifiers with memorable names like{' '}
            <code className="text-indigo-600 font-mono bg-indigo-50 px-1 rounded">alice{CNS_SUFFIX}</code>.
            Easy to share, easy to remember.
          </p>

          <div className="max-w-xl mx-auto">
            <NameSearch autoFocus size="large" />
          </div>

          {isDemo && (
            <p className="text-sm text-gray-500 mt-4">
              Try searching for &ldquo;alice&rdquo;, &ldquo;bob&rdquo;, or &ldquo;canton-dev&rdquo; to see demo results
            </p>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Search</h3>
                <p className="text-gray-600">
                  Find available names instantly. Names end with{' '}
                  <code className="text-sm text-indigo-600 bg-indigo-50 px-1 rounded">{CNS_SUFFIX}</code> to indicate they 
                  have not been identity-verified.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Register</h3>
                <p className="text-gray-600">
                  Connect your Canton wallet, pay a small Canton Coin fee, and 
                  the name is yours. Renewals are handled through your wallet.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Share</h3>
                <p className="text-gray-600">
                  Share your name instead of a complex party ID. Anyone can 
                  resolve it to find your Canton Network identity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="py-8 text-center">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">About &ldquo;Unverified&rdquo; Names</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                All user-registered names include <code className="text-indigo-600 bg-indigo-50 px-1 rounded">{CNS_SUFFIX}</code> because 
                no real-world identity verification is performed. Anyone with Canton 
                Coin can register any available name. This does not mean the name is 
                suspicious—just that the Canton Network has not verified who owns it.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
