/**
 * useSeal - Lock and open messages with a passphrase
 * @module hooks/useSeal
 */

import { useCallback, useRef, useState } from 'react';
import { SealError, openSeal, sealText, type SealOptions } from '../grimoire/rites/seal';

/**
 * Return value of {@link useSeal}.
 */
export interface SealReturn {
  /** Locks `text`. Resolves with the sealed message, or `null` when it failed (see `error`). */
  seal: (text: string, passphrase: string) => Promise<string | null>;
  /** Opens a sealed message. Resolves with the text, or `null` when it failed (see `error`). */
  open: (sealed: string, passphrase: string) => Promise<string | null>;
  /** Whether a seal is being made or opened. Stretching the passphrase takes a moment. */
  busy: boolean;
  /** What went wrong last, in plain words, or `null`. */
  error: string | null;
  clearError: () => void;
}

const explain = (error: unknown): string => {
  if (error instanceof SealError || error instanceof RangeError) return error.message;
  return 'The browser could not do that. Try again.';
};

/**
 * Seals and opens messages with {@link sealText} and {@link openSeal},
 * keeping a `busy` flag and a plain error. Only the latest call's result
 * counts, so a slow earlier call never overwrites a newer one.
 *
 * @example
 * ```tsx
 * const seal = useSeal();
 * const locked = await seal.seal('Meet at midnight', passphrase);
 * ```
 */
export const useSeal = (options: SealOptions = {}): SealReturn => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptRef = useRef(0);
  const { iterations } = options;

  const run = useCallback(async (work: () => Promise<string>): Promise<string | null> => {
    attemptRef.current += 1;
    const attempt = attemptRef.current;
    setBusy(true);
    setError(null);
    try {
      const result = await work();
      return attempt === attemptRef.current ? result : null;
    } catch (failure) {
      if (attempt === attemptRef.current) setError(explain(failure));
      return null;
    } finally {
      if (attempt === attemptRef.current) setBusy(false);
    }
  }, []);

  const seal = useCallback((text: string, passphrase: string) => run(() => sealText(text, passphrase, { iterations })), [run, iterations]);
  const open = useCallback((sealed: string, passphrase: string) => run(() => openSeal(sealed, passphrase)), [run]);
  const clearError = useCallback(() => setError(null), []);

  return { seal, open, busy, error, clearError };
};
