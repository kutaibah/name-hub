'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef, useEffect } from 'react';
import { getReadAdapter, getRegistrationAdapter } from '@/lib/cns/adapter';
import type { NameAvailability, CreateAnsEntryRequest, ResolvedName } from '@/lib/cns/types';
import { validateName } from '@/lib/cns/types';

export function useCnsSearch(prefix: string, limit: number = 10) {
  return useQuery({
    queryKey: ['cns-search', prefix, limit],
    queryFn: async () => {
      if (!prefix || prefix.length < 2) return [];
      const adapter = getReadAdapter();
      return adapter.searchByPrefix(prefix, limit);
    },
    enabled: prefix.length >= 2,
    staleTime: 30_000,
  });
}

export function useCnsLookup(name: string) {
  return useQuery({
    queryKey: ['cns-lookup', name],
    queryFn: async () => {
      const adapter = getReadAdapter();
      return adapter.lookupByName(name);
    },
    enabled: !!name,
    staleTime: 60_000,
  });
}

export function useCnsResolve(name: string) {
  return useQuery({
    queryKey: ['cns-resolve', name],
    queryFn: async () => {
      const adapter = getReadAdapter();
      return adapter.resolve(name);
    },
    enabled: !!name,
    staleTime: 60_000,
  });
}

export function useCnsPartyLookup(partyId: string) {
  return useQuery({
    queryKey: ['cns-party', partyId],
    queryFn: async () => {
      const adapter = getReadAdapter();
      return adapter.lookupByParty(partyId);
    },
    enabled: !!partyId,
    staleTime: 60_000,
  });
}

interface UseNameAvailabilityOptions {
  debounceMs?: number;
}

export function useNameAvailability(options: UseNameAvailabilityOptions = {}) {
  const { debounceMs = 400 } = options;
  const [input, setInput] = useState('');
  const [availability, setAvailability] = useState<NameAvailability>({ status: 'checking' });
  const [isChecking, setIsChecking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback(async (name: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!name || name.length < 3) {
      setAvailability({ status: 'checking' });
      setIsChecking(false);
      return;
    }

    const validation = validateName(name);
    if (!validation.valid) {
      setAvailability({ status: 'invalid', reason: validation.reason });
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    abortControllerRef.current = new AbortController();

    try {
      const adapter = getReadAdapter();
      const result = await adapter.checkAvailability(name);
      
      if (!abortControllerRef.current?.signal.aborted) {
        setAvailability(result);
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        setAvailability({ 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Failed to check availability' 
        });
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setAvailability({ status: 'checking' });
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      checkAvailability(value);
    }, debounceMs);
  }, [checkAvailability, debounceMs]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const reset = useCallback(() => {
    setInput('');
    setAvailability({ status: 'checking' });
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    input,
    setInput: handleInputChange,
    availability,
    isChecking,
    reset,
  };
}

export function useUserEntries() {
  return useQuery({
    queryKey: ['user-entries'],
    queryFn: async () => {
      const adapter = getRegistrationAdapter();
      return adapter.getUserEntries();
    },
    staleTime: 30_000,
  });
}

export function useRegistrationConfig() {
  return useQuery({
    queryKey: ['registration-config'],
    queryFn: async () => {
      const adapter = getRegistrationAdapter();
      return adapter.getRegistrationConfig();
    },
    staleTime: 300_000,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: CreateAnsEntryRequest) => {
      const adapter = getRegistrationAdapter();
      return adapter.requestRegistration(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-entries'] });
    },
  });
}

interface UseCnsRecipientInputOptions {
  debounceMs?: number;
  onSelect?: (resolved: ResolvedName) => void;
}

export function useCnsRecipientInput(options: UseCnsRecipientInputOptions = {}) {
  const { debounceMs = 300, onSelect } = options;
  const [input, setInputState] = useState('');
  const [resolved, setResolved] = useState<ResolvedName | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolve = useCallback(async (name: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (!name || name.length < 3) {
      setResolved(null);
      setError(null);
      setIsResolving(false);
      return;
    }

    const validation = validateName(name);
    if (!validation.valid) {
      setResolved(null);
      setError(validation.reason);
      setIsResolving(false);
      return;
    }

    setIsResolving(true);
    setError(null);
    abortRef.current = new AbortController();

    try {
      const adapter = getReadAdapter();
      const result = await adapter.resolve(validation.canonicalName);
      
      if (!abortRef.current?.signal.aborted) {
        if (result) {
          setResolved(result);
          setError(null);
        } else {
          setResolved(null);
          setError('Name not found');
        }
      }
    } catch (err) {
      if (!abortRef.current?.signal.aborted) {
        setResolved(null);
        setError(err instanceof Error ? err.message : 'Resolution failed');
      }
    } finally {
      setIsResolving(false);
    }
  }, []);

  const setInput = useCallback((value: string) => {
    setInputState(value);
    setIsSelected(false);
    setResolved(null);
    setError(null);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      resolve(value);
    }, debounceMs);
  }, [resolve, debounceMs]);

  const select = useCallback(() => {
    if (resolved && !resolved.isExpired) {
      setIsSelected(true);
      onSelect?.(resolved);
    }
  }, [resolved, onSelect]);

  const clear = useCallback(() => {
    setInputState('');
    setResolved(null);
    setError(null);
    setIsSelected(false);
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return {
    input,
    setInput,
    resolved,
    isResolving,
    error,
    isSelected,
    select,
    clear,
    canSelect: resolved !== null && !resolved.isExpired && !isSelected,
  };
}
