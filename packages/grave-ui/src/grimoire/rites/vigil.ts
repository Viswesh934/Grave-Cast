/**
 * The Vigil: keeps the screen awake while the candle burns.
 * @module grimoire/rites/vigil
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';

/** Keeping the screen awake. */
export const wakeLockCapability = defineCapability({
  id: 'wake-lock',
  label: 'Screen Wake Lock',
  secure: true,
  detect: () => 'wakeLock' in navigator,
});

/** Filling the screen with one element. */
export const fullscreenCapability = defineCapability({
  id: 'fullscreen',
  label: 'Fullscreen',
  detect: () => typeof document.documentElement.requestFullscreen === 'function' && document.fullscreenEnabled !== false,
});

/** The Vigil's own wording for what can go wrong. */
export const VIGIL_MESSAGES = {
  unsupported: 'This browser cannot keep the screen awake.',
  denied: 'The browser would not keep the screen awake. Battery saver may be on.',
  ended: 'The candle went out. The screen may sleep again.',
} as const;

export const vigilRite = defineRite({
  id: 'vigil',
  name: 'Vigil',
  tagline: 'Keeps the screen awake while the candle burns, and lights it again when you come back.',
  sigil: 'candle',
  accent: 'candle',
  family: 'binding',
  support: {
    chromium: 'full',
    firefox: 'full',
    safari: 'full',
    note: 'Needs a secure (https) page. Older Safari versions cannot keep the screen awake.',
  },
  capability: wakeLockCapability,
});
