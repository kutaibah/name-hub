'use client';

import { forwardRef, useId } from 'react';
import type { ResolveResult } from '../resolve-contract';
import { getReasonMessage } from '../resolve-contract';
import { useCnsResolve } from './use-cns-resolve';

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

function joinClass(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
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

    const cardClass = !result
      ? ''
      : result.status === 'ok' || (needsConfirmation && isConfirmed)
        ? 'cns-recipient__card--ok'
        : needsConfirmation && !isConfirmed
          ? 'cns-recipient__card--warn'
          : isBlocked
            ? 'cns-recipient__card--block'
            : '';

    const statusBadge = (() => {
      if (!result) return null;
      switch (result.status) {
        case 'ok':
          return (
            <span className="cns-recipient__badge cns-recipient__badge--ok">
              {result.verified ? 'Verified' : 'Resolved'}
            </span>
          );
        case 'unverified':
          return <span className="cns-recipient__badge cns-recipient__badge--warn">Unverified</span>;
        case 'changed':
          return <span className="cns-recipient__badge cns-recipient__badge--changed">Changed</span>;
        case 'expired':
          return <span className="cns-recipient__badge cns-recipient__badge--block">Expired</span>;
        case 'missing':
          return (
            <span className="cns-recipient__badge cns-recipient__badge--block">
              {result.reasonCode === 'INVALID_INPUT' ? 'Invalid' : 'Not Found'}
            </span>
          );
        default:
          return null;
      }
    })();

    return (
      <div className={joinClass('cns-recipient', className)}>
        {label && (
          <label htmlFor={id} className="cns-recipient__label">
            {label}
          </label>
        )}
        {description && <p className="cns-recipient__description">{description}</p>}

        <div className="cns-recipient__field">
          <svg className="cns-recipient__search-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={ref}
            id={id}
            type="text"
            className="cns-recipient__input"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-describedby={result ? `${id}-result` : undefined}
            aria-invalid={isBlocked || !!error}
          />
          {isResolving && <span className="cns-recipient__spinner" aria-hidden />}
          {!isResolving && input && (
            <button
              type="button"
              className="cns-recipient__clear"
              onClick={clear}
              title="Clear"
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>

        {error && !isResolving && (
          <div className="cns-recipient__error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div
            className={joinClass('cns-recipient__card', cardClass)}
            id={`${id}-result`}
            role="status"
            aria-live="polite"
          >
            <div className="cns-recipient__row">
              {result.name && <code className="cns-recipient__name">{result.name}</code>}
              {statusBadge}
              {showNetworkBadge && (
                <span className="cns-recipient__badge cns-recipient__badge--neutral">
                  {result.source === 'demo' ? 'Demo' : 'Live'}
                </span>
              )}
            </div>

            <p className="cns-recipient__message">{getReasonMessage(result.reasonCode)}</p>

            {result.partyId && (
              <div className="cns-recipient__party" title={result.partyId}>
                Party: {formatPartyId(result.partyId, true)}
                {result.expiresAt && (
                  <div style={{ marginTop: 4, color: '#64748b' }}>
                    Expires: {new Date(result.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            {result.status === 'changed' && result.previousPartyId && (
              <div className="cns-recipient__previous">
                <strong>Previous:</strong>{' '}
                <code>{formatPartyId(result.previousPartyId, true)}</code>
              </div>
            )}

            {needsConfirmation && !isConfirmed && (
              <div className="cns-recipient__confirm">
                <input
                  id={`${id}-confirm`}
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => {
                    if (e.target.checked) confirm();
                  }}
                />
                <label htmlFor={`${id}-confirm`}>
                  {result.status === 'unverified'
                    ? 'I understand this name is not identity-verified and accept the risk'
                    : 'I confirm the party ID has changed and want to proceed with the new owner'}
                </label>
              </div>
            )}

            {needsConfirmation && isConfirmed && (
              <div className={joinClass('cns-recipient__footer', 'cns-recipient__footer--ok')}>
                Confirmed — ready to use
              </div>
            )}

            {result.status === 'ok' && (
              <div className={joinClass('cns-recipient__footer', 'cns-recipient__footer--ok')}>
                {result.verified ? 'Verified identity — safe to use' : 'Resolved — ready to use'}
              </div>
            )}

            {isBlocked && (
              <div className={joinClass('cns-recipient__footer', 'cns-recipient__footer--block')}>
                Cannot proceed —{' '}
                {result.status === 'expired' ? 'name has expired' : 'resolution failed'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export function CnsRecipientInputExample() {
  return (
    <div style={{ maxWidth: 28 * 16 }}>
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
