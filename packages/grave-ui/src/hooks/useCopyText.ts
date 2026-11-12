/**
 * useCopyText - Copy text to the clipboard, with a short "Copied" state
 * @module hooks/useCopyText
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** How long `copied` stays `true` after a copy, in milliseconds. */
export const COPY_FEEDBACK_MS = 1800;

/** Messages for when copying cannot happen. */
export const COPY_MESSAGES = {
  unsupported: 'Copying is not available in this browser.',
  blocked: 'Copying was blocked. Select the text and copy it by hand.',
} as const;

/**
 * Return value of {@link useCopyText}.
 */
export interface CopyTextReturn {
  /** Copies `text`. Call it from a click. Resolves `true` when it worked. */
  copy: (text: string) => Promise<boolean>;
  /** `true` for a moment after a successful copy, so a button can say "Copied". */
  copied: boolean;
  /** Why the last copy failed, or `null`. */
  error: string | null;
}

/**
 * Copies text with the Clipboard API and keeps a short-lived `copied` flag
 * for button feedback. Failures (blocked permission, insecure page) become a
 * plain message instead of an exception.
 *
 * @example
 * ```tsx
 * const { copy, copied } = useCopyText();
 * <button onClick={() => copy(selector)}>{copied ? 'Copied' : 'Copy'}</button>
 * ```
 *
 * @param feedbackMs - How long `copied` stays on. @default COPY_FEEDBACK_MS
 */
export const useCopyText = (feedbackMs: number = COPY_FEEDBACK_MS): CopyTextReturn => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function') {
        setCopied(false);
        setError(COPY_MESSAGES.unsupported);
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setError(null);
        setCopied(true);
        timerRef.current = setTimeout(() => setCopied(false), feedbackMs);
        return true;
      } catch {
        setCopied(false);
        setError(COPY_MESSAGES.blocked);
        return false;
      }
    },
    [feedbackMs]
  );

  return { copy, copied, error };
};
