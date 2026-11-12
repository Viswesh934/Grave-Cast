/**
 * The Séance: tabs of the same site talk to each other.
 * @module grimoire/rites/seance
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';

/** Talking between tabs. */
export const seanceCapability = defineCapability({
  id: 'seance',
  label: 'BroadcastChannel',
  detect: () => typeof BroadcastChannel === 'function',
});

export const seanceRite = defineRite({
  id: 'seance',
  name: 'Séance',
  tagline: 'Gathers every open tab of this site in one circle, to see who is here and pass whispers between them.',
  sigil: 'bell',
  accent: 'soulfire',
  family: 'binding',
  support: { chromium: 'full', firefox: 'full', safari: 'full' },
  capability: seanceCapability,
});

/** The channel tabs meet on unless another is given. */
export const SEANCE_CHANNEL = 'grimoire-seance';
/** How often each tab says it is still here, in ms. */
export const SEANCE_HEARTBEAT_MS = 2000;
/** How long a silent tab stays in the circle, in ms. */
export const SEANCE_TIMEOUT_MS = 6000;
/** Longest spirit name, in characters. */
export const SEANCE_NAME_LIMIT = 40;
/** Longest whisper, in characters. */
export const SEANCE_TEXT_LIMIT = 280;
/** Whispers kept. Older ones are forgotten. */
export const SEANCE_MESSAGE_LIMIT = 50;
/** Longest id or shared value accepted from another tab. */
const ID_LIMIT = 80;
/** Characters of randomness in a spirit id. */
const ID_RANDOM_LENGTH = 8;
/** Radix used to turn random numbers into id text. */
const ID_RADIX = 36;
/** Multiplier of the small string hash that picks a spirit name. */
const NAME_HASH_MULTIPLIER = 31;

/** Names given to tabs that do not choose one. */
export const SPIRIT_NAMES = ['Wailing Widow', 'Pale Rider', 'Lantern Child', 'Drowned Sailor', 'Grey Lady', 'Hollow Monk', 'Ash Bride', 'Silent Cook'] as const;

/** A fresh id for this tab. */
export const createSpiritId = (): string => {
  const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(ID_RADIX).slice(2, 2 + ID_RANDOM_LENGTH);
  return `spirit-${random}`;
};

/** The same friendly name for the same id, every time. */
export const nameSpirit = (id: string): string => {
  let hash = 0;
  for (const char of id) hash = (hash * NAME_HASH_MULTIPLIER + char.charCodeAt(0)) >>> 0;
  return SPIRIT_NAMES[hash % SPIRIT_NAMES.length];
};

/**
 * What tabs say to each other.
 *
 * - `hello`: a tab joined; others answer with `here`
 * - `here`: still present, with the shared value it knows
 * - `whisper`: a message for everyone
 * - `value`: the shared value changed
 * - `bye`: a tab left
 */
export type SeanceWire =
  | { type: 'hello'; from: string; name: string }
  | { type: 'here'; from: string; name: string; value: string | null; valueAt: number }
  | { type: 'whisper'; from: string; name: string; text: string; at: number }
  | { type: 'value'; from: string; value: string; valueAt: number }
  | { type: 'bye'; from: string };

const isText = (value: unknown, limit: number): value is string => typeof value === 'string' && value.length > 0 && value.length <= limit;
const isTime = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

/**
 * Checks a message from another tab and returns it typed, or `null` when it
 * is not a Séance message. Never trust what arrives on a channel: any page of
 * this site can post to it.
 */
export const readSeanceWire = (data: unknown): SeanceWire | null => {
  if (typeof data !== 'object' || data === null) return null;
  const message = data as Record<string, unknown>;
  if (!isText(message.from, ID_LIMIT)) return null;
  const from = message.from;
  switch (message.type) {
    case 'hello':
      return isText(message.name, SEANCE_NAME_LIMIT) ? { type: 'hello', from, name: message.name } : null;
    case 'here': {
      if (!isText(message.name, SEANCE_NAME_LIMIT) || !isTime(message.valueAt)) return null;
      const value = message.value === null ? null : isText(message.value, ID_LIMIT) ? message.value : undefined;
      return value === undefined ? null : { type: 'here', from, name: message.name, value, valueAt: message.valueAt };
    }
    case 'whisper':
      return isText(message.name, SEANCE_NAME_LIMIT) && isText(message.text, SEANCE_TEXT_LIMIT) && isTime(message.at)
        ? { type: 'whisper', from, name: message.name, text: message.text, at: message.at }
        : null;
    case 'value':
      return isText(message.value, ID_LIMIT) && isTime(message.valueAt)
        ? { type: 'value', from, value: message.value, valueAt: message.valueAt }
        : null;
    case 'bye':
      return { type: 'bye', from };
    default:
      return null;
  }
};
