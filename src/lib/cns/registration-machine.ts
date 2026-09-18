import type { RegistrationState as RegistrationStateType, CreateAnsEntryRequest, AnsEntry } from './types';
import { getReadAdapter, getRegistrationAdapter } from './adapter';
import { getDemoScenario, createDemoEntry, DEMO_PARTY_ID } from './demo-fixtures';
import { isDemoMode } from './config';

export type { RegistrationStateType as RegistrationState };
export type { CreateAnsEntryRequest, AnsEntry };

export type RegistrationAction =
  | { type: 'START'; name: string }
  | { type: 'SUBMIT'; request: CreateAnsEntryRequest }
  | { type: 'WALLET_ACCEPTED' }
  | { type: 'WALLET_REJECTED'; reason: string }
  | { type: 'PAYMENT_PROCESSING' }
  | { type: 'PAYMENT_CONFIRMED' }
  | { type: 'ENTRY_CONFIRMED'; entry: AnsEntry }
  | { type: 'ERROR'; error: string }
  | { type: 'TIMEOUT' }
  | { type: 'RESET' };

export function registrationReducer(
  state: RegistrationStateType,
  action: RegistrationAction
): RegistrationStateType {
  switch (action.type) {
    case 'START':
      return { status: 'ready', name: action.name };
    
    case 'SUBMIT':
      if (state.status !== 'ready') return state;
      return { status: 'submitting', name: state.name };
    
    case 'WALLET_ACCEPTED':
      if (state.status !== 'awaiting_wallet') return state;
      return { 
        status: 'awaiting_payment', 
        name: state.name, 
        subscriptionRequestCid: state.subscriptionRequestCid 
      };
    
    case 'WALLET_REJECTED':
      if (state.status !== 'awaiting_wallet') return state;
      return { status: 'rejected', name: state.name, reason: action.reason };
    
    case 'PAYMENT_PROCESSING':
      if (state.status !== 'awaiting_payment') return state;
      return { status: 'awaiting_confirmation', name: state.name };
    
    case 'ENTRY_CONFIRMED':
      if (state.status !== 'awaiting_confirmation' && state.status !== 'awaiting_payment') return state;
      return { status: 'confirmed', name: state.name, entry: action.entry };
    
    case 'ERROR':
      return { 
        status: 'failed', 
        name: state.status !== 'idle' ? (state as { name: string }).name : '', 
        error: action.error 
      };
    
    case 'TIMEOUT':
      if (state.status === 'idle' || state.status === 'confirmed' || state.status === 'failed') {
        return state;
      }
      return { 
        status: 'timeout', 
        name: (state as { name: string }).name, 
        lastKnownState: state.status 
      };
    
    case 'RESET':
      return { status: 'idle' };
    
    default:
      return state;
  }
}

export interface RegistrationManager {
  state: RegistrationStateType;
  start(name: string): void;
  submit(request: CreateAnsEntryRequest): Promise<void>;
  simulateWalletApproval(): Promise<void>;
  simulateWalletRejection(reason: string): void;
  checkConfirmation(): Promise<boolean>;
  reset(): void;
}

export function createRegistrationManager(
  onStateChange: (state: RegistrationStateType) => void
): RegistrationManager {
  let currentState: RegistrationStateType = { status: 'idle' };
  let confirmationPollCount = 0;
  const MAX_POLL_COUNT = 20;

  function dispatch(action: RegistrationAction): void {
    currentState = registrationReducer(currentState, action);
    onStateChange(currentState);
  }

  function getState(): RegistrationStateType {
    return currentState;
  }

  return {
    get state() {
      return getState();
    },

    start(name: string): void {
      dispatch({ type: 'START', name });
      confirmationPollCount = 0;
    },

    async submit(request: CreateAnsEntryRequest): Promise<void> {
      if (currentState.status !== 'ready') {
        throw new Error(`Cannot submit in state: ${currentState.status}`);
      }

      dispatch({ type: 'SUBMIT', request });

      try {
        const adapter = getRegistrationAdapter();
        const response = await adapter.requestRegistration(request);
        
        currentState = {
          status: 'awaiting_wallet',
          name: request.name,
          subscriptionRequestCid: response.subscriptionRequestCid,
          entryContextCid: response.entryContextCid,
        };
        onStateChange(currentState);
      } catch (error) {
        dispatch({ 
          type: 'ERROR', 
          error: error instanceof Error ? error.message : 'Registration request failed' 
        });
        throw error;
      }
    },

    async simulateWalletApproval(): Promise<void> {
      if (currentState.status !== 'awaiting_wallet') {
        throw new Error(`Cannot approve wallet in state: ${currentState.status}`);
      }

      if (!isDemoMode()) {
        throw new Error('Wallet simulation only available in demo mode');
      }

      const scenario = getDemoScenario();

      await new Promise(resolve => setTimeout(resolve, 500));

      if (scenario === 'rejected_approval') {
        dispatch({ type: 'WALLET_REJECTED', reason: 'User declined the subscription request' });
        return;
      }

      if (scenario === 'insufficient_funds') {
        dispatch({ type: 'ERROR', error: 'Insufficient Canton Coin balance' });
        return;
      }

      dispatch({ type: 'WALLET_ACCEPTED' });

      await new Promise(resolve => setTimeout(resolve, scenario === 'processing_slow' ? 3000 : 800));
      dispatch({ type: 'PAYMENT_PROCESSING' });

      await new Promise(resolve => setTimeout(resolve, scenario === 'processing_slow' ? 4000 : 1200));

      const newEntry = createDemoEntry(
        currentState.name,
        DEMO_PARTY_ID,
        '',
        'Newly registered name'
      );
      dispatch({ type: 'ENTRY_CONFIRMED', entry: newEntry });
    },

    simulateWalletRejection(reason: string): void {
      if (currentState.status !== 'awaiting_wallet') {
        throw new Error(`Cannot reject wallet in state: ${currentState.status}`);
      }
      dispatch({ type: 'WALLET_REJECTED', reason });
    },

    async checkConfirmation(): Promise<boolean> {
      if (
        currentState.status !== 'awaiting_confirmation' &&
        currentState.status !== 'awaiting_payment'
      ) {
        return false;
      }

      confirmationPollCount++;

      if (confirmationPollCount > MAX_POLL_COUNT) {
        dispatch({ type: 'TIMEOUT' });
        return false;
      }

      const name = currentState.name;
      const adapter = getReadAdapter();

      try {
        const entry = await adapter.lookupByName(name);
        if (entry) {
          dispatch({ type: 'ENTRY_CONFIRMED', entry });
          return true;
        }
        return false;
      } catch (error) {
        console.warn('Confirmation check failed:', error);
        return false;
      }
    },

    reset(): void {
      dispatch({ type: 'RESET' });
      confirmationPollCount = 0;
    },
  };
}

export function getRegistrationStatusMessage(state: RegistrationStateType): string {
  switch (state.status) {
    case 'idle':
      return '';
    case 'ready':
      return `Ready to register ${state.name}`;
    case 'submitting':
      return 'Submitting registration request...';
    case 'awaiting_wallet':
      return 'Please approve the subscription in your wallet';
    case 'awaiting_payment':
      return 'Processing payment...';
    case 'awaiting_confirmation':
      return 'Waiting for on-chain confirmation...';
    case 'confirmed':
      return `Successfully registered ${state.name}!`;
    case 'rejected':
      return `Registration rejected: ${state.reason}`;
    case 'failed':
      return `Registration failed: ${state.error}`;
    case 'timeout':
      return 'Registration timed out. Please check your wallet for status.';
    default:
      return '';
  }
}

export function canRetry(state: RegistrationStateType): boolean {
  return state.status === 'failed' || state.status === 'rejected' || state.status === 'timeout';
}

export function isTerminal(state: RegistrationStateType): boolean {
  return state.status === 'confirmed' || state.status === 'failed' || state.status === 'rejected';
}
