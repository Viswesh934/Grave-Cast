/**
 * Rite status and error messages, shared by every Grimoire rite.
 * @module grimoire/core/status
 */

/**
 * Where a rite stands.
 *
 * - `idle`: not started, or stopped
 * - `requesting`: starting, for example waiting for a permission prompt
 * - `active`: running
 * - `denied`: the user or browser refused permission
 * - `unavailable`: this browser or page cannot do it, or what it needs is missing
 * - `error`: something else went wrong
 */
export type RiteStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error';

/**
 * Plain-language explanations for everything that can go wrong, kept in one
 * place so every rite words problems the same way. Rites may override any of
 * them with wording that fits what they do.
 */
export const RITE_MESSAGES = {
  server: 'This only works in the browser.',
  insecure: 'This needs a secure (https) page.',
  unsupported: 'This browser cannot do this.',
  denied: 'Permission was denied. Allow it in your browser settings and try again.',
  missing: 'What this needs could not be found.',
  busy: 'This is busy right now. Try again in a moment.',
  quota: 'There is not enough storage space left on this device.',
  timeout: 'This took too long. Try again.',
  network: 'The connection failed. Check your network and try again.',
  invalid: 'That could not be read. It may be damaged or in the wrong format.',
  ended: 'This stopped on its own.',
  unknown: 'Something went wrong. Try again.',
} as const;

/** The name of one message in {@link RITE_MESSAGES}. */
export type RiteMessageKey = keyof typeof RITE_MESSAGES;

/** A full set of messages, such as {@link RITE_MESSAGES} with a rite's overrides. */
export type RiteMessages = Record<RiteMessageKey, string>;

/**
 * What a failure means, from {@link classifyRiteError}.
 */
export interface RiteFailure {
  /** The status the rite should move to. */
  status: RiteStatus;
  /** Which message explains it. */
  key: RiteMessageKey;
  /** The explanation to show. Empty when the failure was a cancellation. */
  message: string;
  /** `true` when the work was cancelled on purpose, which is not an error. */
  aborted: boolean;
  /** The browser's error name, such as `NotAllowedError`, if there was one. */
  name: string;
}

/** Browser error names, grouped by what they mean for the user. */
const ERROR_KINDS: Record<string, { status: RiteStatus; key: RiteMessageKey }> = {
  NotAllowedError: { status: 'denied', key: 'denied' },
  PermissionDeniedError: { status: 'denied', key: 'denied' },
  SecurityError: { status: 'denied', key: 'denied' },
  NotFoundError: { status: 'unavailable', key: 'missing' },
  DevicesNotFoundError: { status: 'unavailable', key: 'missing' },
  NotSupportedError: { status: 'unavailable', key: 'unsupported' },
  QuotaExceededError: { status: 'error', key: 'quota' },
  NotReadableError: { status: 'error', key: 'busy' },
  InvalidStateError: { status: 'error', key: 'busy' },
  TrackStartError: { status: 'error', key: 'busy' },
  TimeoutError: { status: 'error', key: 'timeout' },
  NetworkError: { status: 'error', key: 'network' },
  DataError: { status: 'error', key: 'invalid' },
  DataCloneError: { status: 'error', key: 'invalid' },
  OperationError: { status: 'error', key: 'invalid' },
  EncodingError: { status: 'error', key: 'invalid' },
  InvalidCharacterError: { status: 'error', key: 'invalid' },
  SyntaxError: { status: 'error', key: 'invalid' },
};

/** Reads `error.name` from anything that was thrown. */
const errorName = (error: unknown): string =>
  typeof error === 'object' && error !== null && typeof (error as { name?: unknown }).name === 'string'
    ? (error as { name: string }).name
    : '';

/**
 * Turns anything a browser API throws or rejects with into a status and a
 * plain-language message.
 *
 * `AbortError` counts as a cancellation (`aborted: true`, status `idle`), so
 * stopping a rite never shows an error.
 *
 * @example
 * ```ts
 * try {
 *   await navigator.wakeLock.request('screen');
 * } catch (error) {
 *   const { status, message } = classifyRiteError(error);
 *   show(status, message);
 * }
 * ```
 *
 * @param error - Whatever was thrown.
 * @param messages - Messages to use, so a rite's own wording wins. @default RITE_MESSAGES
 */
export const classifyRiteError = (error: unknown, messages: RiteMessages = RITE_MESSAGES): RiteFailure => {
  const name = errorName(error);
  if (name === 'AbortError') return { status: 'idle', key: 'unknown', message: '', aborted: true, name };
  const kind = ERROR_KINDS[name] ?? { status: 'error', key: 'unknown' };
  return { status: kind.status, key: kind.key, message: messages[kind.key], aborted: false, name };
};

/** Fills in any messages a rite did not override. */
export const resolveRiteMessages = (overrides?: Partial<RiteMessages>): RiteMessages =>
  overrides ? { ...RITE_MESSAGES, ...overrides } : RITE_MESSAGES;
