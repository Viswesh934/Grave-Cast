/**
 * Rite specs: the short description every rite is registered with.
 * @module grimoire/core/rite
 */

import type { SigilGlyph } from '../../components/grimoire/RiteSigil';
import type { GrimoireAccent } from '../tokens';
import type { Capability } from './capability';

/**
 * The four kinds of rite.
 *
 * - `seeing`: look inside the page
 * - `watching`: notice what moves, changes, and is looked at
 * - `keeping`: hold things on the device
 * - `binding`: tie the page to the screen, other tabs, and the outside
 */
export type RiteFamily = 'seeing' | 'watching' | 'keeping' | 'binding';

/** What each family is called and what it is for, in plain words. */
export const RITE_FAMILIES: Record<RiteFamily, { label: string; description: string }> = {
  seeing: { label: 'Seeing', description: 'Look inside the page: boxes, colors, and words.' },
  watching: { label: 'Watching', description: 'Notice what moves, changes, and is looked at.' },
  keeping: { label: 'Keeping', description: 'Hold things on the device, sealed and safe.' },
  binding: { label: 'Binding', description: 'Tie the page to the screen, other tabs, and the outside.' },
};

/**
 * How well a browser supports a rite.
 *
 * - `full`: everything works
 * - `partial`: works, with a fallback or a missing part
 * - `none`: the rite explains that it cannot run
 */
export type BrowserSupport = 'full' | 'partial' | 'none';

/** Support in the three browser engines. */
export interface RiteSupport {
  chromium: BrowserSupport;
  firefox: BrowserSupport;
  safari: BrowserSupport;
  /** What is missing where support is partial, in plain words. */
  note?: string;
}

/**
 * The description of one rite. This is all the docs and pickers need to
 * show a rite; its behavior lives in its hook and component.
 */
export interface RiteSpec {
  /** Stable id, used in links, such as `medium`. */
  id: string;
  /** The rite's name, such as "Medium". */
  name: string;
  /** One plain line on what it does. */
  tagline: string;
  sigil: SigilGlyph;
  accent: GrimoireAccent;
  family: RiteFamily;
  support: RiteSupport;
  /** Inspects or changes the page, so it only runs in development builds unless enabled. @default false */
  devOnly?: boolean;
  /** What it needs from the browser. */
  capability?: Capability;
}

/**
 * Describes a rite. Identity at runtime, apart from freezing the spec.
 *
 * @example
 * ```ts
 * export const vigilRite = defineRite({
 *   id: 'vigil',
 *   name: 'Vigil',
 *   tagline: 'Keeps the screen awake while the candle burns.',
 *   sigil: 'candle',
 *   accent: 'candle',
 *   family: 'binding',
 *   support: { chromium: 'full', firefox: 'full', safari: 'full' },
 * });
 * ```
 */
export const defineRite = (spec: RiteSpec): Readonly<RiteSpec> => Object.freeze({ ...spec, support: Object.freeze({ ...spec.support }) });
