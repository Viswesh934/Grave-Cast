/**
 * Bestiary character tokens
 *
 * Shared material shades for the creature cast. Recognizable accents anchor to
 * the core `palette` so creatures stay consistent with the rest of the system;
 * creature-specific materials (fur, candy, pumpkin flesh, etc.) that have no
 * core equivalent are named here once and reused across every character,
 * following the established component-token-extension rule.
 *
 * @module components/bestiary/characterTokens
 */

import { palette } from '../../tokens';

/** Size presets shared by every character. One scale, no per-creature magic numbers. */
export const characterSizes = {
  sm: 64,
  md: 104,
  lg: 160,
} as const;

/** Hover-bob animation timing, shared across the cast. */
export const characterMotion = {
  /** Vertical bob travel in viewBox units. */
  bob: 4,
  /** Transition duration for hover transforms. */
  transition: '400ms',
} as const;

/**
 * Creature material shades. Grouped by material family rather than by creature,
 * so a new character picks from this shelf instead of inventing new hex.
 */
export const creatureMaterials = {
  /** Fur / pelt tones for mammalian monsters (yeti, werewolf, goblin down). */
  fur: {
    snow: '#eef3f8',
    frost: '#cddde8',
    ash: palette.mist[400],
    soot: palette.dark[700],
  },
  /** Skin / flesh tones for humanoid monsters. */
  flesh: {
    corpse: '#9bb0a6',
    goblin: '#6f8f4f',
    goblinShade: '#4d6636',
    candyman: '#b7895f',
    frankenstein: '#7fa08a',
    frankensteinShade: '#577363',
  },
  /** Gourd / plant tones. */
  gourd: {
    pumpkin: '#e8791f',
    pumpkinShade: '#b4560f',
    stem: '#4d6636',
  },
  /** Leather / membrane tones for winged things (bats). */
  membrane: {
    bat: palette.dark[700],
    batShade: palette.dark[800],
    wing: '#2b2440',
  },
  /** Cloth / shroud tones (vampire cape, candyman coat). */
  cloth: {
    vampire: '#1a0d12',
    vampireLining: palette.sanguine.coagulated,
    coat: '#3a2518',
  },
  /** Hard surfaces: stitches, bolts, teeth, claws. */
  hard: {
    bone: palette.bone[200],
    toothYellow: '#d8cf9e',
    bolt: '#8a8f9c',
    stitch: '#30261b',
  },
} as const;

/**
 * Eye-glow accents keyed to recognizable creature moods. These drive the
 * eye fill and the soft aura, so a creature only picks an accent name.
 */
export const creatureAccents = {
  witchfire: palette.witch.fire,
  emerald: palette.witch.emerald,
  blood: palette.sanguine.crimson,
  gold: palette.witch.gold,
  frost: '#7fd4ff',
  ember: creatureMaterials.gourd.pumpkin,
  void: palette.mist[200],
} as const;

export type CreatureAccent = keyof typeof creatureAccents;
