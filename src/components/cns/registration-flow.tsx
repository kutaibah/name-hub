'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  AlertCircle,
  Loader2,
  Wallet,
  Clock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/lib/cns/auth-context';
import { useRegistrationConfig } from '@/lib/hooks/use-cns';
import { 
  createRegistrationManager, 
  getRegistrationStatusMessage,
  canRetry,
  type RegistrationManager,
} from '@/lib/cns/registration-machine';
import type { RegistrationState, CreateAnsEntryRequest } from '@/lib/cns/types';
import { validateName } from '@/lib/cns/types';
import { isDemoMode } from '@/lib/cns/config';
import { cn } from '@/lib/utils';

interface RegistrationStepProps {
  step: number;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'complete' | 'error';
  children?: React.ReactNode;
}

function RegistrationStep({ step, title, description, status, children }: RegistrationStepProps) {
  return (
    <div className={cn(
      'flex gap-4 p-4 rounded-lg transition-colors',
      status === 'current' && 'bg-secondary/50',
      status === 'error' && 'bg-destructive/10',
    )}>
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
        status === 'pending' && 'bg-muted text-muted-foreground',
        status === 'current' && 'bg-primary text-primary-foreground',
        status === 'complete' && 'bg-success text-success-foreground',
        status === 'error' && 'bg-destructive text-destructive-foreground',
      )}>
        {status === 'complete' ? <Check className="h-4 w-4" /> : 
         status === 'error' ? <X className="h-4 w-4" /> : step}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

function getStepStatus(
  currentStatus: RegistrationState['status'],
  targetStep: 1 | 2 | 3 | 4
): 'pending' | 'current' | 'complete' | 'error' {
  const statusOrder: Record<RegistrationState['status'], number> = {
    idle: 0,
    ready: 1,
    submitting: 2,
    awaiting_wallet: 2,
    awaiting_payment: 3,
    awaiting_confirmation: 3,
    confirmed: 4,
    rejected: 2,
    failed: 2,
    timeout: 3,
  };

  const currentOrder = statusOrder[currentStatus];
  
  if (currentStatus === 'rejected' || currentStatus === 'failed') {
    if (targetStep === 2) return 'error';
    if (targetStep < 2) return 'complete';
    return 'pending';
  }
  
  if (currentStatus === 'timeout') {
    if (targetStep === 3) return 'error';
    if (targetStep < 3) return 'complete';
    return 'pending';
  }

  if (targetStep < currentOrder) return 'complete';
  if (targetStep === currentOrder || (targetStep === currentOrder + 1 && currentOrder > 0)) return 'current';
  return 'pending';
}

export function RegistrationFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get('name') || '';
  
  const { user, connect, isConnecting, isDemo } = useAuth();
  const { data: config } = useRegistrationConfig();
  
  const name = initialName;
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [registrationState, setRegistrationState] = useState<RegistrationState>({ status: 'idle' });
  const managerRef = useRef<RegistrationManager | null>(null);

  const validation = name ? validateName(name) : null;
  const canonicalName = validation?.valid ? validation.canonicalName : null;

  useEffect(() => {
    const mgr = createRegistrationManager(setRegistrationState);
    managerRef.current = mgr;
    
    if (canonicalName && mgr.state.status === 'idle') {
      mgr.start(canonicalName);
    }
    
    return () => mgr.reset();
  }, [canonicalName]);

  const handleSubmit = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager || !canonicalName || !user) return;
    
    const request: CreateAnsEntryRequest = {
      name: canonicalName,
      url: url.trim(),
      description: description.trim(),
    };

    try {
      await manager.submit(request);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  }, [canonicalName, url, description, user]);

  const handleWalletApprove = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager || !isDemoMode()) return;
    try {
      await manager.simulateWalletApproval();
    } catch (error) {
      console.error('Wallet approval failed:', error);
    }
  }, []);

  const handleWalletReject = useCallback(() => {
    const manager = managerRef.current;
    if (!manager || !isDemoMode()) return;
    manager.simulateWalletRejection('User declined the subscription');
  }, []);

  const handleRetry = useCallback(() => {
    const manager = managerRef.current;
    if (!manager || !canonicalName) return;
    manager.reset();
    manager.start(canonicalName);
  }, [canonicalName]);

  const handleViewName = useCallback(() => {
    if (registrationState.status === 'confirmed') {
      router.push(`/name/${encodeURIComponent(registrationState.entry.name)}`);
    }
  }, [registrationState, router]);

  const isSubmitting = registrationState.status === 'submitting';
  const isAwaitingWallet = registrationState.status === 'awaiting_wallet';
  const isProcessing = registrationState.status === 'awaiting_payment' || registrationState.status === 'awaiting_confirmation';
  const isSuccess = registrationState.status === 'confirmed';
  const isError = registrationState.status === 'failed' || registrationState.status === 'rejected';
  const isTimeout = registrationState.status === 'timeout';

  if (!name && !initialName) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Register a Name</CardTitle>
          <CardDescription>Search for an available name first</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Go to Search
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Register Name</h1>
      </div>

      {isDemo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            This registration is simulated. No real Canton Coin will be spent.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Name to Register</CardTitle>
              {canonicalName && (
                <code className="text-xl font-mono text-primary mt-1 block">
                  {canonicalName}
                </code>
              )}
            </div>
            {config && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Registration Fee</p>
                <p className="text-lg font-semibold">{config.fee} {config.unit}</p>
                <p className="text-xs text-muted-foreground">per {config.lifetimeDays} days</p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-1">
        <RegistrationStep
          step={1}
          title="Connect Wallet"
          description={user ? `Connected as ${user.displayName || 'User'}` : 'Connect your Canton wallet to continue'}
          status={user ? 'complete' : 'current'}
        >
          {!user && (
            <Button onClick={() => connect()} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </RegistrationStep>

        <RegistrationStep
          step={2}
          title="Submit Registration Request"
          description="Provide optional details and submit your request"
          status={getStepStatus(registrationState.status, 2)}
        >
          {user && registrationState.status === 'ready' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium" htmlFor="url">
                  URL (optional)
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://your-website.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  maxLength={255}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="description">
                  Description (optional)
                </label>
                <Input
                  id="description"
                  type="text"
                  placeholder="A brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={140}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/140 characters
                </p>
              </div>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {registrationState.status === 'rejected' ? 'Rejected' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {registrationState.status === 'rejected' 
                  ? registrationState.reason 
                  : registrationState.status === 'failed' 
                    ? registrationState.error
                    : 'An error occurred'}
              </AlertDescription>
            </Alert>
          )}
        </RegistrationStep>

        <RegistrationStep
          step={3}
          title="Approve in Wallet"
          description="Accept the subscription payment request"
          status={getStepStatus(registrationState.status, 3)}
        >
          {isAwaitingWallet && isDemo && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                In live mode, you would approve this in your Canton wallet.
                For demo, use the buttons below:
              </p>
              <div className="flex gap-2">
                <Button onClick={handleWalletApprove}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve Payment
                </Button>
                <Button variant="outline" onClick={handleWalletReject}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{getRegistrationStatusMessage(registrationState)}</span>
            </div>
          )}

          {isTimeout && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Timeout</AlertTitle>
              <AlertDescription>
                The confirmation took too long. Please check your wallet for the transaction status.
              </AlertDescription>
            </Alert>
          )}
        </RegistrationStep>

        <RegistrationStep
          step={4}
          title="Registration Complete"
          description="Your name is now registered on Canton Network"
          status={getStepStatus(registrationState.status, 4)}
        >
          {isSuccess && (
            <div className="space-y-4">
              <Alert className="border-success/50 bg-success/10">
                <Check className="h-4 w-4 text-success" />
                <AlertTitle className="text-success">Success!</AlertTitle>
                <AlertDescription>
                  <code className="font-mono">{registrationState.entry.name}</code> is now registered to your account.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={handleViewName}>
                  View Name Details
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <Link href="/names">
                  <Button variant="outline">
                    My Names
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </RegistrationStep>
      </div>

      {canRetry(registrationState) && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
