'use client';

import { useCallback, useRef, useState } from 'react';
import { CnsRecipientInput } from '@/components/cns/cns-recipient-input';
import type { ResolveResult } from '@/lib/cns/resolve-contract';
import { DEMO_EXAMPLES } from './demo-examples';

export { DEMO_EXAMPLES } from './demo-examples';

const STATUS_COLORS: Record<ResolveResult['status'], string> = {
  ok: 'text-green-700 bg-green-50 border-green-200',
  unverified: 'text-amber-800 bg-amber-50 border-amber-200',
  changed: 'text-orange-800 bg-orange-50 border-orange-200',
  expired: 'text-red-800 bg-red-50 border-red-200',
  missing: 'text-red-800 bg-red-50 border-red-200',
};

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function ResolverPlayground({
  id = 'resolver-playground',
  compact = false,
}: {
  id?: string;
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastResult, setLastResult] = useState<ResolveResult | null>(null);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const tryExample = useCallback((input: string) => {
    const el = containerRef.current?.querySelector<HTMLInputElement>('input[type="text"]');
    if (el) {
      setInputValue(el, input);
      setActiveExample(input);
    }
  }, []);

  return (
    <div id={id} className="space-y-4">
      <div
        ref={containerRef}
        className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${compact ? '' : 'sm:p-5'}`}
      >
        <CnsRecipientInput
          label="Recipient"
          description="Type a CNS name or try an example below"
          onResolve={setLastResult}
          showNetworkBadge
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {DEMO_EXAMPLES.map((ex) => (
          <button
            key={ex.input}
            type="button"
            onClick={() => tryExample(ex.input)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors hover:border-indigo-300 hover:bg-indigo-50 ${
              activeExample === ex.input
                ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-200'
                : 'border-gray-200 bg-white'
            }`}
          >
            <code className="font-mono font-medium text-gray-900">{ex.label}</code>
            <span className="text-gray-500">→ {ex.status}</span>
          </button>
        ))}
      </div>

      {lastResult && (
        <div
          className={`rounded-lg border p-4 font-mono text-sm ${STATUS_COLORS[lastResult.status]}`}
          data-testid="resolve-result-panel"
        >
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-sans font-medium uppercase tracking-wide opacity-70">status</dt>
              <dd className="font-semibold">{lastResult.status}</dd>
            </div>
            <div>
              <dt className="text-xs font-sans font-medium uppercase tracking-wide opacity-70">reasonCode</dt>
              <dd className="font-semibold">{lastResult.reasonCode}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-sans font-medium uppercase tracking-wide opacity-70">partyId</dt>
              <dd className="break-all">{lastResult.partyId ?? '—'}</dd>
            </div>
            {lastResult.name && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-sans font-medium uppercase tracking-wide opacity-70">name</dt>
                <dd>{lastResult.name}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
