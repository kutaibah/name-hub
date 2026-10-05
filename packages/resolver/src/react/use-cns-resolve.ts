'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getResolver } from '../resolver-runtime';
import type { ResolveResult, ResolveOptions } from '../resolve-contract';

export interface UseCnsResolveOptions {
  debounceMs?: number;
  onResolve?: (result: ResolveResult) => void;
  onChange?: (data: { partyId: string | null; result: ResolveResult | null; confirmed: boolean }) => void;
}

export interface UseCnsResolveReturn {
  input: string;
  setInput: (value: string) => void;
  result: ResolveResult | null;
  isResolving: boolean;
  error: string | null;
  isConfirmed: boolean;
  confirm: () => void;
  clear: () => void;
  canUse: boolean;
  needsConfirmation: boolean;
  isBlocked: boolean;
}

export function useCnsResolve(options: UseCnsResolveOptions = {}): UseCnsResolveReturn {
  const { debounceMs = 300, onResolve, onChange } = options;

  const [input, setInputState] = useState('');
  const [result, setResult] = useState<ResolveResult | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResolveRef = useRef(onResolve);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onResolveRef.current = onResolve;
    onChangeRef.current = onChange;
  }, [onResolve, onChange]);

  const resolveInput = useCallback(async (inputValue: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (!inputValue || inputValue.trim().length < 3) {
      setResult(null);
      setError(null);
      setIsResolving(false);
      setIsConfirmed(false);
      onChangeRef.current?.({ partyId: null, result: null, confirmed: false });
      return;
    }

    setIsResolving(true);
    setError(null);
    abortRef.current = new AbortController();

    try {
      const resolver = getResolver();
      const opts: ResolveOptions = { signal: abortRef.current.signal };
      const resolveResult = await resolver.resolve(inputValue, opts);

      if (!abortRef.current?.signal.aborted) {
        setResult(resolveResult);
        setIsConfirmed(false);
        onResolveRef.current?.(resolveResult);

        const usablePartyId = resolveResult.status === 'ok' ? resolveResult.partyId : null;
        onChangeRef.current?.({ partyId: usablePartyId, result: resolveResult, confirmed: false });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (!abortRef.current?.signal.aborted) {
        setResult(null);
        setError(err instanceof Error ? err.message : 'Resolution failed');
        onChangeRef.current?.({ partyId: null, result: null, confirmed: false });
      }
    } finally {
      setIsResolving(false);
    }
  }, []);

  const setInput = useCallback(
    (value: string) => {
      setInputState(value);
      setResult(null);
      setError(null);
      setIsConfirmed(false);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        resolveInput(value);
      }, debounceMs);
    },
    [resolveInput, debounceMs]
  );

  const confirm = useCallback(() => {
    if (result?.requiresConfirmation && result.partyId) {
      setIsConfirmed(true);
      onChangeRef.current?.({ partyId: result.partyId, result, confirmed: true });
    }
  }, [result]);

  const clear = useCallback(() => {
    setInputState('');
    setResult(null);
    setError(null);
    setIsConfirmed(false);
    if (abortRef.current) {
      abortRef.current.abort();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onChangeRef.current?.({ partyId: null, result: null, confirmed: false });
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

  const needsConfirmation = result?.requiresConfirmation === true;
  const isBlocked = result?.blocking === true;

  const canUse =
    result !== null &&
    (result.status === 'ok' || (result.requiresConfirmation && isConfirmed));

  return {
    input,
    setInput,
    result,
    isResolving,
    error,
    isConfirmed,
    confirm,
    clear,
    canUse,
    needsConfirmation,
    isBlocked,
  };
}
