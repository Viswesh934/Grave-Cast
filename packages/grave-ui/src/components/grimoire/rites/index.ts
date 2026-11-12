/**
 * Ready-made rites: each one a complete panel built on the Grimoire parts.
 * @module components/grimoire/rites
 */

export { MediumRite, MEDIUM_POSSESSIONS, MEDIUM_PALETTE_SHOWN, type MediumRiteProps } from './MediumRite';
export { SoulReaderRite, SOUL_READER_PALETTE_SHOWN, SOUL_READER_ISSUES_SHOWN, type SoulReaderRiteProps } from './SoulReaderRite';
export { HauntedInkRite, INK_ANNOUNCE_DELAY_MS, type HauntedInkRiteProps } from './HauntedInkRite';
export { VigilRite, VIGIL_CLASS, vigilTokens, type VigilRiteProps } from './VigilRite';
export { NecromancerRite, NECROMANCER_SCRUB_STEP, type NecromancerRiteProps } from './NecromancerRite';
export { SeanceRite, SEANCE_BOARD, type SeanceRiteProps } from './SeanceRite';
export { PoltergeistRite, type PoltergeistRiteProps } from './PoltergeistRite';
export {
  CryptRite,
  CRYPT_DATABASE,
  CRYPT_STORE,
  KEEPSAKE_TITLE_LIMIT,
  KEEPSAKE_WORDS_LIMIT,
  type CryptRiteProps,
  type CryptKeepsake,
} from './CryptRite';
export { SealRite, type SealMode, type SealRiteProps } from './SealRite';
export { WatchingEyesRite, WATCHING_EYES_SHOWN, HEAT_STRENGTH, type WatchingEyesRiteProps } from './WatchingEyesRite';
export { ApparitionRite, APPARITION_STEP_MS, APPARITION_VISITORS, type ApparitionRiteProps } from './ApparitionRite';
export { AutopsyRite, AUTOPSY_ORDER, type AutopsyRiteProps } from './AutopsyRite';
