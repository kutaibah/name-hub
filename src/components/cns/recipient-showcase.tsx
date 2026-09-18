'use client';

import { useState } from 'react';
import { Copy, Check, Code, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CnsRecipientInput } from './cns-recipient-input';
import type { ResolvedName } from '@/lib/cns/types';
import { isDemoMode } from '@/lib/cns/config';

const EXAMPLE_CODE = `import { CnsRecipientInput } from '@/components/cns/cns-recipient-input';

function TransferForm() {
  const [recipient, setRecipient] = useState<ResolvedName | null>(null);

  return (
    <form onSubmit={handleTransfer}>
      <CnsRecipientInput
        label="Recipient"
        description="Enter a CNS name to resolve the recipient"
        onSelect={(resolved) => setRecipient(resolved)}
      />
      
      {recipient && (
        <div>
          <p>Sending to: {recipient.canonicalName}</p>
          <p>Party ID: {recipient.partyId}</p>
        </div>
      )}
      
      <button type="submit" disabled={!recipient}>
        Continue
      </button>
    </form>
  );
}`;

export function RecipientShowcase() {
  const [selectedRecipient, setSelectedRecipient] = useState<ResolvedName | null>(null);
  const [copied, setCopied] = useState(false);
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

  const handleSelect = (resolved: ResolvedName) => {
    setSelectedRecipient(resolved);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integration Demo</h1>
        <p className="text-lg text-muted-foreground">
          Reusable CNS name resolution for your Canton applications
        </p>
      </div>

      {isDemo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            This demo uses simulated data. Try searching for names like &ldquo;alice&rdquo;, &ldquo;bob&rdquo;, or &ldquo;canton-dev&rdquo;.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>CnsRecipientInput Component</CardTitle>
          <CardDescription>
            A drop-in component that handles CNS name resolution with debouncing,
            error handling, and explicit selection UX.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Try it out</h3>
            <CnsRecipientInput
              label="Select Recipient"
              description="Enter a CNS name to resolve to a Canton party ID"
              onSelect={handleSelect}
              showNetworkBadge={true}
            />
          </div>

          {selectedRecipient && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  Recipient Selected
                </h3>
                <div className="bg-secondary rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Canonical Name:</span>
                    <code className="font-mono text-sm">{selectedRecipient.canonicalName}</code>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Party ID:</span>
                    <code className="font-mono text-xs break-all max-w-[300px] text-right">
                      {selectedRecipient.partyId}
                    </code>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Network:</span>
                    <span className="text-sm">{selectedRecipient.network}</span>
                  </div>
                  {selectedRecipient.expiresAt && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Expires:</span>
                      <span className="text-sm">
                        {new Date(selectedRecipient.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Integration Point</AlertTitle>
                  <AlertDescription>
                    In a real application, you would use this resolved party ID to construct 
                    a Canton transaction. This demo does not send any actual transactions.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Integration Example
              </CardTitle>
              <CardDescription>
                Copy this code to integrate CNS name resolution in your app
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
          <pre className="bg-secondary rounded-lg p-4 overflow-x-auto text-sm">
            <code>{EXAMPLE_CODE}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              'Debounced lookup with configurable delay',
              'Automatic validation of name format',
              'Loading, error, and success states',
              'Stale request protection (cancels outdated queries)',
              'Keyboard navigation (Enter to select, Escape to clear)',
              'Accessible with proper ARIA attributes',
              'Explicit selection requirement before use',
              'Expired name detection and warning',
              'Network badge showing live vs demo mode',
              'Callback with full resolved data (name, party, network, metadata)',
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-secondary/30">
        <CardContent className="py-6">
          <h3 className="font-medium mb-2">Future: Extractable Package</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This component is designed to be extracted into a standalone npm package
            for easy integration across Canton Network applications. For now, copy
            the component source directly into your project.
          </p>
          <div className="flex gap-2">
            <Badge variant="outline">Not yet published</Badge>
            <Badge variant="outline">Copy source for now</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
