'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AuthenticatedUser } from './types';
import { isDemoMode } from './config';
import { DEMO_PARTY_ID } from './demo-fixtures';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER: AuthenticatedUser = {
  partyId: DEMO_PARTY_ID,
  displayName: 'Demo User',
  isConnected: true,
};

function getInitialUser(): AuthenticatedUser | null {
  if (typeof window === 'undefined') return null;
  
  const isDemo = isDemoMode();
  const stored = sessionStorage.getItem('cns_auth');
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (isDemo && parsed.isDemo) {
        return DEMO_USER;
      }
    } catch {
      sessionStorage.removeItem('cns_auth');
    }
  }
  
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(getInitialUser);
  const [isConnecting, setIsConnecting] = useState(false);
  const isDemo = isDemoMode();

  const connect = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setUser(DEMO_USER);
        sessionStorage.setItem('cns_auth', JSON.stringify({ isDemo: true }));
      } else {
        throw new Error(
          'Live wallet connection requires the Canton dApp SDK. ' +
          'Please configure the application for live mode with proper credentials.'
        );
      }
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isDemo]);

  const disconnect = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('cns_auth');
  }, []);

  return (
    <AuthContext value={{ user, isConnecting, connect, disconnect, isDemo }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(): AuthenticatedUser {
  const { user } = useAuth();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
