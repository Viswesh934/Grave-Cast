/**
 * The Seal: locks text with a passphrase, on the device, with the Web Crypto API.
 * @module grimoire/rites/seal
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';

/** Locking and unlocking with Web Crypto. */
export const sealCapability = defineCapability({
  id: 'seal',
  label: 'Web Crypto',
  secure: true,
  detect: () => typeof crypto !== 'undefined' && typeof crypto.subtle?.encrypt === 'function',
});

export const sealRite = defineRite({
  id: 'seal',
  name: 'Seal',
  tagline: 'Locks a message with a passphrase so only someone who knows it can read it. Nothing leaves the device.',
  sigil: 'key',
  accent: 'candle',
  family: 'keeping',
  support: { chromium: 'full', firefox: 'full', safari: 'full', note: 'Needs a secure (https) page.' },
  capability: sealCapability,
});

/** The start of every sealed message, with the format version. */
export const SEAL_PREFIX = 'seal1';
/** Times the passphrase is stretched. Higher is slower to guess and slower to seal. */
export const SEAL_ITERATIONS = 600_000;
/** Fewest and most stretches accepted when opening, so a crafted seal cannot hang the page. */
export const SEAL_MIN_ITERATIONS = 100_000;
export const SEAL_MAX_ITERATIONS = 5_000_000;
/** Longest message that can be sealed, in characters. */
export const SEAL_TEXT_LIMIT = 10_000;
/** Bytes of random salt and nonce. */
const SALT_BYTES = 16;
const IV_BYTES = 12;
/** AES key length, in bits. */
const KEY_BITS = 256;
/** Parts of a sealed message: prefix, stretches, salt, nonce, locked text. */
const SEAL_PARTS = 5;
/** Characters per chunk when turning bytes into text, to stay under argument limits. */
const BYTE_CHUNK = 0x8000;

/**
 * Why a seal could not be opened.
 *
 * - `format`: the text is not a sealed message, or it was cut short
 * - `passphrase`: the passphrase is wrong, or the message was changed
 */
export type SealFailure = 'format' | 'passphrase';

/** Thrown by {@link openSeal}, with a reason a person can act on. */
export class SealError extends Error {
  readonly reason: SealFailure;
  constructor(reason: SealFailure) {
    super(reason === 'format' ? 'This is not a sealed message, or part of it is missing.' : 'That passphrase does not open this seal.');
    this.name = 'SealError';
    this.reason = reason;
  }
}

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  for (let index = 0; index < bytes.length; index += BYTE_CHUNK) binary += String.fromCharCode(...bytes.subarray(index, index + BYTE_CHUNK));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (text: string): Uint8Array => {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new SealError('format');
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const deriveKey = async (passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> => {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    material,
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    ['encrypt', 'decrypt']
  );
};

/** The parts of a sealed message, from {@link readSeal}. */
export interface SealParts {
  iterations: number;
  salt: Uint8Array;
  iv: Uint8Array;
  data: Uint8Array;
}

/** Splits a sealed message into its parts, or returns `null` when it is not one. */
export const readSeal = (sealed: string): SealParts | null => {
  const parts = sealed.trim().split('.');
  if (parts.length !== SEAL_PARTS || parts[0] !== SEAL_PREFIX) return null;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < SEAL_MIN_ITERATIONS || iterations > SEAL_MAX_ITERATIONS) return null;
  try {
    const salt = fromBase64Url(parts[2]);
    const iv = fromBase64Url(parts[3]);
    const data = fromBase64Url(parts[4]);
    if (salt.length !== SALT_BYTES || iv.length !== IV_BYTES || data.length === 0) return null;
    return { iterations, salt, iv, data };
  } catch {
    return null;
  }
};

/** Whether text looks like a sealed message. */
export const isSealed = (text: string): boolean => readSeal(text) !== null;

/**
 * Options for {@link sealText}.
 */
export interface SealOptions {
  /** How many times the passphrase is stretched. @default SEAL_ITERATIONS */
  iterations?: number;
}

/**
 * Locks `text` with `passphrase`. The passphrase is stretched with PBKDF2
 * (SHA-256) into an AES-GCM key, so the result can only be opened with the
 * same passphrase, and any change to it is noticed. The result is plain
 * text, safe to paste anywhere:
 * `seal1.<stretches>.<salt>.<nonce>.<locked text>`.
 *
 * @example
 * ```ts
 * const sealed = await sealText('Meet at midnight', 'correct horse battery staple');
 * const text = await openSeal(sealed, 'correct horse battery staple');
 * ```
 */
export const sealText = async (text: string, passphrase: string, options: SealOptions = {}): Promise<string> => {
  const { iterations = SEAL_ITERATIONS } = options;
  if (text.length > SEAL_TEXT_LIMIT) throw new RangeError(`Messages can be at most ${SEAL_TEXT_LIMIT} characters.`);
  if (passphrase === '') throw new RangeError('A passphrase is needed.');
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt, iterations);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)));
  return [SEAL_PREFIX, iterations, toBase64Url(salt), toBase64Url(iv), toBase64Url(data)].join('.');
};

/**
 * Opens a message made by {@link sealText}. Throws a {@link SealError} when
 * the text is not a seal or the passphrase is wrong.
 */
export const openSeal = async (sealed: string, passphrase: string): Promise<string> => {
  const parts = readSeal(sealed);
  if (!parts) throw new SealError('format');
  const key = await deriveKey(passphrase, parts.salt, parts.iterations);
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: parts.iv as BufferSource }, key, parts.data as BufferSource);
    return new TextDecoder().decode(plain);
  } catch {
    throw new SealError('passphrase');
  }
};

/** How hard a passphrase would be to guess, from {@link judgePassphrase}. */
export interface PassphraseVerdict {
  /** 0 (empty) to 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Empty' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  /** One tip, or an empty string when there is nothing to add. */
  advice: string;
}

/** Lengths at which a passphrase earns another point. */
const PASSPHRASE_LENGTHS = [8, 14, 20] as const;
/** Kinds of character (lower, upper, digit, symbol) needed to earn a point. */
const PASSPHRASE_VARIETY = 3;
/** The best score. */
const PASSPHRASE_MAX_SCORE = 4;
/** Scores at or above this need no advice. */
const PASSPHRASE_GOOD_SCORE = 3;
const PASSPHRASE_LABELS = { 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' } as const;

/**
 * A rough, offline judgment of a passphrase: longer is better, and a mix of
 * characters helps. It never sends the passphrase anywhere.
 */
export const judgePassphrase = (passphrase: string): PassphraseVerdict => {
  if (passphrase === '') return { score: 0, label: 'Empty', advice: 'Choose a passphrase you will remember.' };
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(passphrase)).length;
  let score = 1 + PASSPHRASE_LENGTHS.filter((length) => passphrase.length >= length).length;
  if (kinds >= PASSPHRASE_VARIETY) score += 1;
  const clamped = Math.min(PASSPHRASE_MAX_SCORE, score) as 1 | 2 | 3 | 4;
  const advice = clamped >= PASSPHRASE_GOOD_SCORE ? '' : 'Longer is stronger. A few unrelated words work well.';
  return { score: clamped, label: PASSPHRASE_LABELS[clamped], advice };
};
