'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  Check,
  ExternalLink,
  Clock,
  User,
  Globe,
  AlertCircle,
  Share2,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCnsResolve } from '@/lib/hooks/use-cns';
import { parseCanonicalName } from '@/lib/cns/types';
import { cn } from '@/lib/utils';

interface NameDetailsProps {
  name: string;
}

export function NameDetails({ name }: NameDetailsProps) {
  const { data: resolved, isLoading, error } = useCnsResolve(name);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/name/${encodeURIComponent(name)}`
    : '';

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
          Back to Search
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Name</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load name details'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
          Back to Search
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="font-mono">{name}</code>
              <Badge variant="outline">Not Found</Badge>
            </CardTitle>
            <CardDescription>
              This name is not registered or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/register?name=${encodeURIComponent(parseCanonicalName(name))}`}>
              <Button>Register This Name</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expired = resolved.isExpired;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-5 w-5" />
        Back to Search
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <code className="text-2xl font-mono text-primary">
                  {resolved.canonicalName}
                </code>
                {expired ? (
                  <Badge variant="destructive" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Expired
                  </Badge>
                ) : (
                  <Badge className="bg-success/20 text-success border-success/30 gap-1">
                    <Check className="h-3 w-3" />
                    Active
                  </Badge>
                )}
                {resolved.isDemo && (
                  <Badge variant="outline">Demo</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                Registered on {resolved.network}
              </CardDescription>
            </div>

            <div className="shrink-0">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG
                  value={shareUrl}
                  size={80}
                  level="M"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unverified Name</AlertTitle>
            <AlertDescription>
              This name has not been verified to correspond to any real-world identity.
              Anyone with sufficient Canton Coin can register any available name.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Owner Party ID
              </h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-secondary p-3 rounded-lg break-all">
                  {resolved.partyId}
                </code>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(resolved.partyId, 'party')}
                    >
                      {copiedField === 'party' ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copiedField === 'party' ? 'Copied!' : 'Copy Party ID'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {resolved.expiresAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Expiration
                </h3>
                <p className={cn(
                  'text-sm',
                  expired ? 'text-destructive' : 'text-foreground'
                )}>
                  {expired ? 'Expired on' : 'Expires on'}{' '}
                  {new Date(resolved.expiresAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {resolved.url && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  Website
                </h3>
                <a
                  href={resolved.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {resolved.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {resolved.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </h3>
                <p className="text-sm">{resolved.description}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(shareUrl, 'url')}
              className="gap-1.5"
            >
              {copiedField === 'url' ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {copiedField === 'url' ? 'Copied!' : 'Share Link'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(resolved.canonicalName, 'name')}
              className="gap-1.5"
            >
              {copiedField === 'name' ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedField === 'name' ? 'Copied!' : 'Copy Name'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
