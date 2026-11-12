/**
 * Every rite's spec, and the registry the docs and pickers read.
 * @module grimoire/rites
 */

import type { RiteSpec } from '../core/rite';
import { apparitionRite } from './apparition';
import { autopsyRite } from './autopsy';
import { cryptRite } from './crypt';
import { hauntedInkRite } from './hauntedInk';
import { mediumRite } from './medium';
import { necromancerRite } from './necromancer';
import { poltergeistRite } from './poltergeist';
import { sealRite } from './seal';
import { seanceRite } from './seance';
import { soulReaderRite } from './soulReader';
import { vigilRite } from './vigil';
import { watchingEyesRite } from './watchingEyes';

export * from './medium';
export * from './soulReader';
export * from './hauntedInk';
export * from './vigil';
export * from './necromancer';
export * from './seance';
export * from './poltergeist';
export * from './crypt';
export * from './seal';
export * from './watchingEyes';
export * from './apparition';
export * from './autopsy';

/** Every rite, in the order they are shown. New rites are added here. */
export const grimoireRites: readonly Readonly<RiteSpec>[] = [
  mediumRite,
  soulReaderRite,
  hauntedInkRite,
  vigilRite,
  necromancerRite,
  seanceRite,
  poltergeistRite,
  cryptRite,
  sealRite,
  watchingEyesRite,
  apparitionRite,
  autopsyRite,
];

/** Finds a rite by id. */
export const findRite = (id: string): Readonly<RiteSpec> | undefined => grimoireRites.find((rite) => rite.id === id);
