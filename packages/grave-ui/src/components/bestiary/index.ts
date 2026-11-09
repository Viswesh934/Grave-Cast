/**
 * Bestiary - the horror character cast and the foundation that powers it.
 *
 * `Character` is the single renderer; `defineCharacter` + the material/accent
 * tokens let you describe new creatures as data. Ten creatures ship ready to
 * drop in; building your own is a short spec away.
 *
 * @module components/bestiary
 */

export { Character } from './Character';
export type { CharacterProps } from './Character';

export { BestiaryCharacter } from './BestiaryCharacter';
export type { BestiaryCharacterProps } from './BestiaryCharacter';

export { defineCharacter } from './types';
export type {
  CharacterSpec,
  CharacterSize,
  CharacterEye,
  CharacterLayer,
  CharacterPart,
  Character3DSpec,
  PartShape,
  PartMotion,
} from './types';

export {
  characterSizes,
  characterMotion,
  creatureMaterials,
  creatureAccents,
} from './characterTokens';
export type { CreatureAccent } from './characterTokens';

export {
  batSpec,
  vampireSpec,
  snowmanSpec,
  yetiSpec,
  pumpkinSpec,
  frankensteinSpec,
  goblinSpec,
  candymanSpec,
  ghostSpec,
  mummySpec,
  bestiary,
} from './characters';
