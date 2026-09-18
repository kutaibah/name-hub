'use client';

import Link from 'next/link';
import {
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/cns/auth-context';
import { useUserEntries } from '@/lib/hooks/use-cns';
import { isExpired } from '@/lib/cns/types';
import { cn } from '@/lib/utils';

function NameEntryCard({ 
  entry, 
  copiedName, 
  onCopy 
}: { 
  entry: { contractId: string; name: string; expiresAt: string; amount: string; unit: string; paymentInterval: string };
  copiedName: string | null;
  onCopy: (name: string) => void;
}) {
  const expired = isExpired(entry.expiresAt);
  const expiresDate = new Date(entry.expiresAt);
  // eslint-disable-next-line react-hooks/purity
  const daysUntilExpiry = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = !expired && daysUntilExpiry <= 7;

  return (
    <Card className={cn(
      expired && 'opacity-60',
      isExpiringSoon && 'border-warning/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="font-mono text-lg text-primary">
                {entry.name}
              </code>
              {expired ? (
                <Badge variant="destructive" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Expired
                </Badge>
              ) : isExpiringSoon ? (
                <Badge variant="outline" className="gap-1 border-warning text-warning">
                  <Clock className="h-3 w-3" />
                  Expires in {daysUntilExpiry} day{daysUntilExpiry === 1 ? '' : 's'}
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Check className="h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
            
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {expired ? 'Expired' : 'Expires'}{' '}
                {expiresDate.toLocaleDateString()}
              </span>
              <span>·</span>
              <span>
                {entry.amount} {entry.unit} / {entry.paymentInterval.replace('P', '').replace('D', ' days')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onCopy(entry.name)}
                >
                  {copiedName === entry.name ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copiedName === entry.name ? 'Copied!' : 'Copy Name'}
              </TooltipContent>
            </Tooltip>
            
            <Link href={`/name/${encodeURIComponent(entry.name)}`}>
              <Button variant="outline" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyNamesList() {
  const { user, connect, isConnecting, isDemo } = useAuth();
  const { data: entries, isLoading, error, refetch } = useUserEntries();
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>My Names</CardTitle>
            <CardDescription>
              Connect your wallet to view your registered names
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => connect()} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Names</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">My Names</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Names</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load your names'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const hasEntries = entries && entries.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Names</h1>
          <p className="text-muted-foreground">
            {hasEntries
              ? `${entries.length} name${entries.length === 1 ? '' : 's'} registered`
              : 'No names registered yet'}
          </p>
        </div>
        <Link href="/">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register New Name
          </Button>
        </Link>
      </div>

      {isDemo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            These are simulated entries. In live mode, this would show names registered to your connected wallet.
          </AlertDescription>
        </Alert>
      )}

      {!hasEntries ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No names yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Register your first Canton Name to get started
            </p>
            <Link href="/">
              <Button>Search Available Names</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <NameEntryCard
              key={entry.contractId}
              entry={entry}
              copiedName={copiedName}
              onCopy={copyToClipboard}
            />
          ))}
        </div>
      )}

      <Card className="bg-secondary/30">
        <CardContent className="py-4">
          <h3 className="font-medium mb-2">Name Management</h3>
          <p className="text-sm text-muted-foreground">
            Renewal, transfer, and other management actions are handled through your Canton wallet.
            {isDemo && ' This functionality is simulated in demo mode.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
