import { describe, it, expect } from 'vitest';
import { 
  registrationReducer, 
  getRegistrationStatusMessage,
  canRetry,
} from '@/lib/cns/registration-machine';
import type { RegistrationState, RegistrationAction } from '@/lib/cns/registration-machine';

describe('registrationReducer', () => {
  const initialState: RegistrationState = { status: 'idle' };

  describe('START action', () => {
    it('transitions from idle to ready', () => {
      const action: RegistrationAction = { type: 'START', name: 'test.unverified.cns' };
      const result = registrationReducer(initialState, action);
      expect(result).toEqual({ status: 'ready', name: 'test.unverified.cns' });
    });
  });

  describe('SUBMIT action', () => {
    it('transitions from ready to submitting', () => {
      const state: RegistrationState = { status: 'ready', name: 'test.unverified.cns' };
      const action: RegistrationAction = { 
        type: 'SUBMIT', 
        request: { name: 'test.unverified.cns', url: '', description: '' } 
      };
      const result = registrationReducer(state, action);
      expect(result).toEqual({ status: 'submitting', name: 'test.unverified.cns' });
    });

    it('ignores SUBMIT when not in ready state', () => {
      const state: RegistrationState = { status: 'idle' };
      const action: RegistrationAction = { 
        type: 'SUBMIT', 
        request: { name: 'test.unverified.cns', url: '', description: '' } 
      };
      const result = registrationReducer(state, action);
      expect(result).toEqual(state);
    });
  });

  describe('WALLET_ACCEPTED action', () => {
    it('transitions from awaiting_wallet to awaiting_payment', () => {
      const state: RegistrationState = { 
        status: 'awaiting_wallet', 
        name: 'test.unverified.cns',
        subscriptionRequestCid: 'cid1',
        entryContextCid: 'cid2'
      };
      const action: RegistrationAction = { type: 'WALLET_ACCEPTED' };
      const result = registrationReducer(state, action);
      expect(result.status).toBe('awaiting_payment');
    });
  });

  describe('WALLET_REJECTED action', () => {
    it('transitions from awaiting_wallet to rejected', () => {
      const state: RegistrationState = { 
        status: 'awaiting_wallet', 
        name: 'test.unverified.cns',
        subscriptionRequestCid: 'cid1',
        entryContextCid: 'cid2'
      };
      const action: RegistrationAction = { type: 'WALLET_REJECTED', reason: 'User declined' };
      const result = registrationReducer(state, action);
      expect(result).toEqual({ status: 'rejected', name: 'test.unverified.cns', reason: 'User declined' });
    });
  });

  describe('ENTRY_CONFIRMED action', () => {
    it('transitions from awaiting_confirmation to confirmed', () => {
      const state: RegistrationState = { 
        status: 'awaiting_confirmation', 
        name: 'test.unverified.cns'
      };
      const mockEntry = {
        contract_id: 'cid',
        user: 'party123',
        name: 'test.unverified.cns',
        url: '',
        description: '',
        expires_at: '2025-01-01T00:00:00Z'
      };
      const action: RegistrationAction = { type: 'ENTRY_CONFIRMED', entry: mockEntry };
      const result = registrationReducer(state, action);
      expect(result.status).toBe('confirmed');
      if (result.status === 'confirmed') {
        expect(result.entry).toEqual(mockEntry);
      }
    });
  });

  describe('ERROR action', () => {
    it('transitions to failed state', () => {
      const state: RegistrationState = { status: 'submitting', name: 'test.unverified.cns' };
      const action: RegistrationAction = { type: 'ERROR', error: 'Network error' };
      const result = registrationReducer(state, action);
      expect(result).toEqual({ status: 'failed', name: 'test.unverified.cns', error: 'Network error' });
    });
  });

  describe('TIMEOUT action', () => {
    it('transitions to timeout state', () => {
      const state: RegistrationState = { status: 'awaiting_confirmation', name: 'test.unverified.cns' };
      const action: RegistrationAction = { type: 'TIMEOUT' };
      const result = registrationReducer(state, action);
      expect(result.status).toBe('timeout');
    });

    it('ignores TIMEOUT in terminal states', () => {
      const confirmedState: RegistrationState = { 
        status: 'confirmed', 
        name: 'test.unverified.cns',
        entry: {
          contract_id: 'cid',
          user: 'party123',
          name: 'test.unverified.cns',
          url: '',
          description: '',
          expires_at: '2025-01-01T00:00:00Z'
        }
      };
      const action: RegistrationAction = { type: 'TIMEOUT' };
      const result = registrationReducer(confirmedState, action);
      expect(result).toEqual(confirmedState);
    });
  });

  describe('RESET action', () => {
    it('transitions to idle', () => {
      const state: RegistrationState = { 
        status: 'failed', 
        name: 'test.unverified.cns',
        error: 'Some error'
      };
      const action: RegistrationAction = { type: 'RESET' };
      const result = registrationReducer(state, action);
      expect(result).toEqual({ status: 'idle' });
    });
  });
});

describe('getRegistrationStatusMessage', () => {
  it('returns empty string for idle', () => {
    expect(getRegistrationStatusMessage({ status: 'idle' })).toBe('');
  });

  it('returns message for ready state', () => {
    const msg = getRegistrationStatusMessage({ status: 'ready', name: 'test.unverified.cns' });
    expect(msg).toContain('test.unverified.cns');
  });

  it('returns success message for confirmed', () => {
    const msg = getRegistrationStatusMessage({ 
      status: 'confirmed', 
      name: 'test.unverified.cns',
      entry: {
        contract_id: 'cid',
        user: 'party123',
        name: 'test.unverified.cns',
        url: '',
        description: '',
        expires_at: null
      }
    });
    expect(msg).toContain('Successfully');
  });
});

describe('canRetry', () => {
  it('returns true for failed state', () => {
    expect(canRetry({ status: 'failed', name: 'test', error: 'error' })).toBe(true);
  });

  it('returns true for rejected state', () => {
    expect(canRetry({ status: 'rejected', name: 'test', reason: 'reason' })).toBe(true);
  });

  it('returns true for timeout state', () => {
    expect(canRetry({ status: 'timeout', name: 'test', lastKnownState: 'awaiting' })).toBe(true);
  });

  it('returns false for confirmed state', () => {
    expect(canRetry({ 
      status: 'confirmed', 
      name: 'test',
      entry: {
        contract_id: 'cid',
        user: 'party123',
        name: 'test',
        url: '',
        description: '',
        expires_at: null
      }
    })).toBe(false);
  });

  it('returns false for idle state', () => {
    expect(canRetry({ status: 'idle' })).toBe(false);
  });
});
