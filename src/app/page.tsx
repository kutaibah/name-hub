'use client';

import { NameSearch } from '@/components/cns/name-search';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNetworkName, isDemoMode } from '@/lib/cns/config';
import { CNS_SUFFIX } from '@/lib/cns/types';
import { Shield, Zap, Globe, Search } from 'lucide-react';

export default function HomePage() {
  const isDemo = isDemoMode();

  return (
    <div className="min-h-[calc(100vh-16rem)]">
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-4">
            {getNetworkName()}
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Human-Readable Names for{' '}
            <span className="text-primary">Canton Network</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Replace long party identifiers with memorable names like{' '}
            <code className="text-primary font-mono">alice{CNS_SUFFIX}</code>.
            Easy to share, easy to remember.
          </p>

          <div className="max-w-xl mx-auto">
            <NameSearch autoFocus size="large" />
          </div>

          {isDemo && (
            <p className="text-sm text-muted-foreground mt-4">
              Try searching for &ldquo;alice&rdquo;, &ldquo;bob&rdquo;, or &ldquo;canton-dev&rdquo; to see demo results
            </p>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Search</h3>
                <p className="text-muted-foreground">
                  Find available names instantly. Names end with{' '}
                  <code className="text-sm">{CNS_SUFFIX}</code> to indicate they 
                  have not been identity-verified.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Register</h3>
                <p className="text-muted-foreground">
                  Connect your Canton wallet, pay a small Canton Coin fee, and 
                  the name is yours. Renewals are handled through your wallet.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/30">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Share</h3>
                <p className="text-muted-foreground">
                  Share your name instead of a complex party ID. Anyone can 
                  resolve it to find your Canton Network identity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Card className="bg-secondary/30">
            <CardContent className="py-8 text-center">
              <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold mb-2">About &ldquo;Unverified&rdquo; Names</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                All user-registered names include <code>{CNS_SUFFIX}</code> because 
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
