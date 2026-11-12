/**
 * Every rite's spec, and the registry the docs and pickers read.
 * @module grimoire/rites
 */

import type { RiteSpec } from '../core/rite';
import { hauntedInkRite } from './hauntedInk';
import { mediumRite } from './medium';
import { soulReaderRite } from './soulReader';
import { vigilRite } from './vigil';

export * from './medium';
export * from './soulReader';
export * from './hauntedInk';
export * from './vigil';

/** Every rite, in the order they are shown. New rites are added here. */
export const grimoireRites: readonly Readonly<RiteSpec>[] = [mediumRite, soulReaderRite, hauntedInkRite, vigilRite];

/** Finds a rite by id. */
export const findRite = (id: string): Readonly<RiteSpec> | undefined => grimoireRites.find((rite) => rite.id === id);
