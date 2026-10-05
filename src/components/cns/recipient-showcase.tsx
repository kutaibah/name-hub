'use client';

import { useState } from 'react';
import { Copy, Check, Code, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { CnsRecipientInput } from './cns-recipient-input';
import type { ResolveResult } from '@/lib/cns/resolve-contract';
import { isDemoMode } from '@/lib/cns/config';

const EXAMPLE_CODE = `import { configureResolver } from '@canton-names/resolver';
import { CnsRecipientInput } from '@canton-names/resolver/react';
import type { ResolveResult } from '@canton-names/resolver';
import '@canton-names/resolver/styles.css';

configureResolver({ mode: 'demo' });

function TransferForm() {
  const [usablePartyId, setUsablePartyId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ResolveResult | null>(null);

  return (
    <form onSubmit={handleTransfer}>
      <CnsRecipientInput
        label="Recipient"
        description="Enter a CNS name or party ID"
        onResolve={(result) => setLastResult(result)}
        onChange={({ partyId }) => setUsablePartyId(partyId)}
      />
      
      {usablePartyId && (
        <p>Ready to send to: {usablePartyId.slice(0, 20)}...</p>
      )}
      
      <button type="submit" disabled={!usablePartyId}>
        Send Transfer
      </button>
    </form>
  );
}`;

const DEMO_NAMES = [
  { name: 'bank', label: 'bank.cns', description: 'Verified identity → ok', status: 'ok' },
  { name: 'alice', label: 'alice.unverified.cns', description: 'Unverified → confirm', status: 'unverified' },
  { name: 'changed-party', label: 'changed-party.unverified.cns', description: 'Party changed → confirm', status: 'changed' },
  { name: 'expired-name', label: 'expired-name.unverified.cns', description: 'Expired → blocked', status: 'expired' },
  { name: 'nonexistent', label: 'nonexistent.unverified.cns', description: 'Not found → blocked', status: 'missing' },
];

export function RecipientShowcase() {
  const [usablePartyId, setUsablePartyId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ResolveResult | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transferAmount, setTransferAmount] = useState('10.0');
  const isDemo = isDemoMode();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(EXAMPLE_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleResolve = (result: ResolveResult) => {
    setLastResult(result);
  };

  const handleChange = (data: { partyId: string | null; result: ResolveResult | null; confirmed: boolean }) => {
    setUsablePartyId(data.partyId);
    setIsConfirmed(data.confirmed);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usablePartyId) return;
    alert(`Demo: Would send ${transferAmount} CC to ${usablePartyId.slice(0, 30)}...`);
  };

  const canSend = usablePartyId !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integration Demo</h1>
        <p className="text-lg text-muted-foreground">
          Safe recipient resolution for Canton applications — &ldquo;Lookup is the product&rdquo;
        </p>
      </div>

      {isDemo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Mode — Try All States</AlertTitle>
          <AlertDescription>
            <p className="mb-3">Click a name to see its resolution state:</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_NAMES.map(({ name, label, description, status }) => (
                <button
                  key={name}
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>('[placeholder="Enter a CNS name or party ID"]');
                    if (input) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                      nativeInputValueSetter?.call(input, name);
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs"
                >
                  <code className="font-mono">{label}</code>
                  <span className="text-muted-foreground">— {description}</span>
                </button>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Mock Transfer Form</CardTitle>
          <CardDescription className="text-gray-600">
            Demonstrates how Send is disabled until the recipient is safely resolved or confirmed.
            The component handles all safety checks — blocking expired/missing names and requiring
            explicit confirmation for unverified or changed party IDs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <CnsRecipientInput
              label="Recipient"
              description="Enter a CNS name or party ID"
              onResolve={handleResolve}
              onChange={handleChange}
              showNetworkBadge={true}
            />

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Amount</label>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="10.0"
                  className="max-w-32"
                />
              </div>
              <span className="text-sm text-muted-foreground pb-2">CC (Canton Coin)</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                {!lastResult && (
                  <span className="text-gray-500">Enter a recipient to continue</span>
                )}
                {lastResult && !canSend && (
                  <span className="text-amber-700 font-medium">
                    {lastResult.blocking 
                      ? '⛔ Cannot send — resolution blocked' 
                      : '⚠️ Confirmation required before sending'}
                  </span>
                )}
                {canSend && (
                  <span className="text-green-700 font-medium">
                    ✓ Ready to send to {lastResult?.name || 'party ID'}
                  </span>
                )}
              </div>
              <Button type="submit" disabled={!canSend} className="gap-2">
                <Send className="h-4 w-4" />
                Send Transfer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {lastResult && (
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base text-gray-900">Resolution Result (Debug View)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-xs text-slate-100">
              <code>{JSON.stringify(lastResult, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Resolution Status Reference</CardTitle>
          <CardDescription className="text-gray-600">How each status affects the Send button</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <Badge className="bg-green-100 text-green-800 border-green-200">ok</Badge>
              <div>
                <p className="font-medium text-green-800">Immediately usable</p>
                <p className="text-sm text-green-700">Verified names resolve to OK. Send enabled.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">unverified</Badge>
              <div>
                <p className="font-medium text-amber-800">Requires confirmation</p>
                <p className="text-sm text-amber-700">User must check the confirmation box. Send enabled after.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">changed</Badge>
              <div>
                <p className="font-medium text-orange-800">Requires confirmation</p>
                <p className="text-sm text-orange-700">Party ID differs from last known. User must confirm the change.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <Badge variant="destructive">expired / missing</Badge>
              <div>
                <p className="font-medium text-red-800">Blocked</p>
                <p className="text-sm text-red-700">Cannot proceed. Send disabled. User must enter a valid recipient.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Code className="h-5 w-5" />
                Integration Example
              </CardTitle>
              <CardDescription className="text-gray-600">
                Copy this code to integrate safe CNS resolution in your app
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm text-slate-100">
            <code>{EXAMPLE_CODE}</code>
          </pre>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Safety Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              'Blocked states (missing, expired, error) prevent accidental sends',
              'Unverified names require explicit user confirmation',
              'Changed party IDs require confirmation with old/new comparison',
              'Debounced resolution prevents request spam',
              'Abort controller cancels stale requests',
              'Local cache detects party ID changes between sessions',
              'Keyboard navigation (Escape to clear)',
              'Accessible with aria-live status announcements',
              'Full ResolveResult exposed via callbacks for custom handling',
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
