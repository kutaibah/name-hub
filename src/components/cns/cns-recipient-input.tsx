'use client';

import { forwardRef, useId } from 'react';
import { Search, Check, X, AlertCircle, Loader2, Clock, AlertTriangle, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCnsResolve } from '@/lib/hooks/use-cns-resolve';
import type { ResolveResult } from '@/lib/cns/resolve-contract';
import { getReasonMessage } from '@/lib/cns/resolve-contract';
import { cn } from '@/lib/utils';

export interface CnsRecipientInputProps {
  onResolve?: (result: ResolveResult) => void;
  onChange?: (data: { partyId: string | null; result: ResolveResult | null; confirmed: boolean }) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  showNetworkBadge?: boolean;
  debounceMs?: number;
}

function formatPartyId(partyId: string, short: boolean = false): string {
  if (short && partyId.length > 20) {
    return `${partyId.slice(0, 10)}...${partyId.slice(-8)}`;
  }
  return partyId;
}

export const CnsRecipientInput = forwardRef<HTMLInputElement, CnsRecipientInputProps>(
  function CnsRecipientInput(
    {
      onResolve,
      onChange,
      placeholder = 'Enter a CNS name or party ID',
      label,
      description,
      disabled = false,
      className,
      showNetworkBadge = true,
      debounceMs = 300,
    },
    ref
  ) {
    const id = useId();
    const {
      input,
      setInput,
      result,
      isResolving,
      error,
      isConfirmed,
      confirm,
      clear,
      canUse,
      needsConfirmation,
      isBlocked,
    } = useCnsResolve({
      debounceMs,
      onResolve,
      onChange,
    });

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        clear();
      }
    };

    const getStatusBadge = () => {
      if (!result) return null;

      switch (result.status) {
        case 'ok':
          return (
            <Badge className="bg-green-600 text-white border-green-700 gap-1">
              <ShieldCheck className="h-3 w-3" />
              {result.verified ? 'Verified' : 'Resolved'}
            </Badge>
          );
        case 'unverified':
          return (
            <Badge className="bg-amber-500 text-white border-amber-600 gap-1">
              <AlertTriangle className="h-3 w-3" />
              Unverified
            </Badge>
          );
        case 'changed':
          return (
            <Badge className="bg-orange-500 text-white border-orange-600 gap-1">
              <RefreshCw className="h-3 w-3" />
              Changed
            </Badge>
          );
        case 'expired':
          return (
            <Badge className="bg-red-600 text-white border-red-700 gap-1">
              <Clock className="h-3 w-3" />
              Expired
            </Badge>
          );
        case 'missing':
          return (
            <Badge className="bg-red-600 text-white border-red-700 gap-1">
              <X className="h-3 w-3" />
              {result.reasonCode === 'INVALID_INPUT' ? 'Invalid' : 'Not Found'}
            </Badge>
          );
      }
    };

    const getMessage = () => {
      if (!result) return null;
      return getReasonMessage(result.reasonCode);
    };

    const getCardStyle = () => {
      if (!result) return '';
      if (result.status === 'ok' || (needsConfirmation && isConfirmed)) {
        return 'border-green-400 bg-green-50 dark:bg-green-950 dark:border-green-700';
      }
      if (needsConfirmation && !isConfirmed) {
        return 'border-amber-400 bg-amber-50 dark:bg-amber-950 dark:border-amber-700';
      }
      if (isBlocked) {
        return 'border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-700';
      }
      return '';
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium mb-1.5">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mb-2">
            {description}
          </p>
        )}
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref}
            id={id}
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="pl-9 pr-10"
            aria-describedby={result ? `${id}-result` : undefined}
            aria-invalid={isBlocked || !!error}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isResolving && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!isResolving && input && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={clear}
                title="Clear"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {error && !isResolving && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-destructive" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <Card 
            className={cn('mt-2 p-3', getCardStyle())} 
            id={`${id}-result`}
            role="status"
            aria-live="polite"
          >
            <div className="space-y-3">
              {/* Status header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.name && (
                      <code className="font-mono text-sm bg-background px-2 py-0.5 rounded border border-border text-foreground">
                        {result.name}
                      </code>
                    )}
                    {getStatusBadge()}
                    {showNetworkBadge && (
                      <Badge variant="outline" className="text-xs bg-background">
                        {result.source === 'demo' ? 'Demo' : 'Live'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm font-medium text-foreground">
                {getMessage()}
              </p>

              {/* Party ID display */}
              {result.partyId && (
                <div className="space-y-1">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs text-foreground/80 font-mono cursor-help block">
                        Party: {formatPartyId(result.partyId, true)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-mono text-xs break-all">{result.partyId}</p>
                    </TooltipContent>
                  </Tooltip>

                  {result.expiresAt && (
                    <p className="text-xs text-foreground/70">
                      Expires: {new Date(result.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Changed: show previous party */}
              {result.status === 'changed' && result.previousPartyId && (
                <div className="text-xs text-orange-700 bg-orange-100 rounded px-2 py-1">
                  <strong>Previous:</strong>{' '}
                  <code className="font-mono">{formatPartyId(result.previousPartyId, true)}</code>
                </div>
              )}

              {/* Confirmation section for unverified/changed */}
              {needsConfirmation && !isConfirmed && (
                <div className="flex items-start gap-2 pt-2 border-t border-amber-200">
                  <Checkbox
                    id={`${id}-confirm`}
                    checked={isConfirmed}
                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                      if (checked === true) confirm();
                    }}
                    className="mt-0.5"
                  />
                  <label 
                    htmlFor={`${id}-confirm`} 
                    className="text-sm text-amber-800 cursor-pointer select-none"
                  >
                    {result.status === 'unverified' 
                      ? 'I understand this name is not identity-verified and accept the risk'
                      : 'I confirm the party ID has changed and want to proceed with the new owner'}
                  </label>
                </div>
              )}

              {/* Confirmed state */}
              {needsConfirmation && isConfirmed && (
                <div className="flex items-center gap-2 pt-2 border-t border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Confirmed — ready to use
                  </span>
                </div>
              )}

              {/* OK state indicator */}
              {result.status === 'ok' && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    {result.verified ? 'Verified identity — safe to use' : 'Resolved — ready to use'}
                  </span>
                </div>
              )}

              {/* Blocked state */}
              {isBlocked && (
                <div className="flex items-center gap-2 pt-2 border-t border-red-200">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">
                    Cannot proceed — {result.status === 'expired' ? 'name has expired' : 'resolution failed'}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  }
);

export function CnsRecipientInputExample() {
  return (
    <div className="max-w-md">
      <CnsRecipientInput
        label="Recipient"
        description="Enter a CNS name or party ID to resolve"
        onResolve={(result) => {
          console.log('Resolved:', result);
        }}
        onChange={({ partyId, confirmed }) => {
          console.log('Usable party:', partyId, 'Confirmed:', confirmed);
        }}
      />
    </div>
  );
}
