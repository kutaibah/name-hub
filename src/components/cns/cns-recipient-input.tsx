'use client';

import { forwardRef, useId } from 'react';
import { Search, Check, X, AlertCircle, Loader2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCnsRecipientInput } from '@/lib/hooks/use-cns';
import { formatPartyId } from '@/lib/cns/types';
import type { ResolvedName } from '@/lib/cns/types';
import { cn } from '@/lib/utils';

export interface CnsRecipientInputProps {
  onSelect?: (resolved: ResolvedName) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  showNetworkBadge?: boolean;
  debounceMs?: number;
}

export const CnsRecipientInput = forwardRef<HTMLInputElement, CnsRecipientInputProps>(
  function CnsRecipientInput(
    {
      onSelect,
      placeholder = 'Enter a CNS name (e.g., alice)',
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
      resolved,
      isResolving,
      error,
      isSelected,
      select,
      clear,
      canSelect,
    } = useCnsRecipientInput({
      debounceMs,
      onSelect,
    });

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && canSelect) {
        e.preventDefault();
        select();
      }
      if (e.key === 'Escape') {
        clear();
      }
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
            disabled={disabled || isSelected}
            className="pl-9 pr-10"
            aria-describedby={resolved ? `${id}-result` : undefined}
            aria-invalid={!!error}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isResolving && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {isSelected && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={clear}
                title="Clear selection"
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

        {resolved && !isSelected && (
          <Card className="mt-2 p-3" id={`${id}-result`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-sm bg-secondary px-2 py-0.5 rounded">
                    {resolved.canonicalName}
                  </code>
                  {resolved.isExpired ? (
                    <Badge variant="destructive" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Expired
                    </Badge>
                  ) : (
                    <Badge className="bg-success/20 text-success border-success/30 gap-1">
                      <Check className="h-3 w-3" />
                      Found
                    </Badge>
                  )}
                  {showNetworkBadge && resolved.isDemo && (
                    <Badge variant="outline" className="text-xs">Demo</Badge>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs text-muted-foreground font-mono cursor-help">
                        Party: {formatPartyId(resolved.partyId, true)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-mono text-xs break-all">{resolved.partyId}</p>
                    </TooltipContent>
                  </Tooltip>

                  {resolved.expiresAt && !resolved.isExpired && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(resolved.expiresAt).toLocaleDateString()}
                    </p>
                  )}

                  {resolved.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {resolved.description}
                    </p>
                  )}
                </div>
              </div>

              {canSelect && (
                <Button
                  size="sm"
                  onClick={select}
                  className="shrink-0"
                >
                  Select
                </Button>
              )}

              {resolved.isExpired && (
                <Badge variant="outline" className="shrink-0 text-destructive border-destructive">
                  Cannot select expired name
                </Badge>
              )}
            </div>
          </Card>
        )}

        {isSelected && resolved && (
          <Card className="mt-2 p-3 border-success/50 bg-success/5">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-success shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Selected: <code className="font-mono">{resolved.canonicalName}</code>
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {resolved.partyId}
                </p>
              </div>
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
        description="Enter a CNS name to resolve the recipient's party ID"
        onSelect={(resolved) => {
          console.log('Selected recipient:', resolved);
        }}
      />
    </div>
  );
}
