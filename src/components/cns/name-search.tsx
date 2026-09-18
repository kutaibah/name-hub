'use client';

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNameAvailability } from '@/lib/hooks/use-cns';
import { validateName, parseCanonicalName } from '@/lib/cns/types';
import { cn } from '@/lib/utils';

interface NameSearchProps {
  autoFocus?: boolean;
  onAvailable?: (canonicalName: string) => void;
  onSelect?: (canonicalName: string) => void;
  showRegisterButton?: boolean;
  size?: 'default' | 'large';
}

export function NameSearch({
  autoFocus = false,
  onAvailable,
  onSelect,
  showRegisterButton = true,
  size = 'default',
}: NameSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { input, setInput, availability, isChecking } = useNameAvailability({
    debounceMs: 400,
  });
  
  const displayCanonical = useMemo(() => {
    if (input.length < 3) return null;
    const validation = validateName(input);
    return validation.valid ? validation.canonicalName : null;
  }, [input]);

  useEffect(() => {
    if (availability.status === 'available' && displayCanonical && onAvailable) {
      onAvailable(displayCanonical);
    }
  }, [availability.status, displayCanonical, onAvailable]);

  const handleRegister = useCallback(() => {
    if (availability.status === 'available' && displayCanonical) {
      if (onSelect) {
        onSelect(displayCanonical);
      } else {
        router.push(`/register?name=${encodeURIComponent(parseCanonicalName(displayCanonical))}`);
      }
    }
  }, [availability.status, displayCanonical, onSelect, router]);

  const handleViewDetails = useCallback(() => {
    if (availability.status === 'taken' && displayCanonical) {
      router.push(`/name/${encodeURIComponent(displayCanonical)}`);
    }
  }, [availability.status, displayCanonical, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (availability.status === 'available') {
        handleRegister();
      } else if (availability.status === 'taken') {
        handleViewDetails();
      }
    }
  }, [availability.status, handleRegister, handleViewDetails]);

  const isLarge = size === 'large';

  return (
    <div className="w-full">
      <div className="relative">
        <Search className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground',
          isLarge ? 'h-5 w-5' : 'h-4 w-4'
        )} />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a name..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className={cn(
            'pl-11 pr-4',
            isLarge && 'h-14 text-lg'
          )}
        />
        {isChecking && (
          <Loader2 className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground',
            isLarge ? 'h-5 w-5' : 'h-4 w-4'
          )} />
        )}
      </div>

      {input.length >= 3 && displayCanonical && (
        <Card className={cn(
          'mt-3 p-4',
          isLarge && 'p-5'
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className={cn(
                  'font-mono text-foreground bg-secondary px-2 py-1 rounded',
                  isLarge ? 'text-lg' : 'text-sm'
                )}>
                  {displayCanonical}
                </code>
                {availability.status === 'available' && (
                  <Badge className="bg-success text-success-foreground gap-1">
                    <Check className="h-3 w-3" />
                    Available
                  </Badge>
                )}
                {availability.status === 'taken' && (
                  <Badge variant="destructive" className="gap-1">
                    <X className="h-3 w-3" />
                    Taken
                  </Badge>
                )}
                {availability.status === 'invalid' && (
                  <Badge variant="outline" className="gap-1 border-destructive text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    Invalid
                  </Badge>
                )}
                {availability.status === 'error' && (
                  <Badge variant="outline" className="gap-1 border-destructive text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    Error
                  </Badge>
                )}
                {availability.status === 'checking' && isChecking && (
                  <Badge variant="outline" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking
                  </Badge>
                )}
              </div>

              {availability.status === 'invalid' && (
                <p className="text-sm text-destructive mt-2">
                  {availability.reason}
                </p>
              )}

              {availability.status === 'error' && (
                <p className="text-sm text-destructive mt-2">
                  {availability.message}
                </p>
              )}

              {availability.status === 'taken' && availability.entry && (
                <p className="text-sm text-muted-foreground mt-2">
                  Owned by another user
                  {availability.entry.expires_at && (
                    <> · Expires {new Date(availability.entry.expires_at).toLocaleDateString()}</>
                  )}
                </p>
              )}

              {availability.status === 'available' && (
                <p className="text-sm text-muted-foreground mt-2">
                  This name is available for registration
                </p>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              {availability.status === 'taken' && (
                <Button
                  variant="outline"
                  size={isLarge ? 'default' : 'sm'}
                  onClick={handleViewDetails}
                >
                  View Details
                </Button>
              )}
              {availability.status === 'available' && showRegisterButton && (
                <Button
                  size={isLarge ? 'default' : 'sm'}
                  onClick={handleRegister}
                >
                  Register Name
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {input.length > 0 && input.length < 3 && (
        <p className="text-sm text-muted-foreground mt-2 pl-1">
          Enter at least 3 characters
        </p>
      )}
    </div>
  );
}
