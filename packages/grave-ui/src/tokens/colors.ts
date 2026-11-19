/**
 * Color tokens for Grave-UI
 * Organized by horror archetype with folklore-inspired palettes
 * @module tokens/colors
 */

import type { ColorSystem } from './types';

/**
 * Complete color system organized by folklore archetype.
 * 
 * Each archetype has its own palette inspired by horror traditions:
 * - **Crypt**: Weathered stone, moss, granite from graveyards
 * - **Sanguine**: Blood, crimson, coagulated tones from vampire lore
 * - **Witchcraft**: Dark void, spectral emerald, curse gold from covens
 * - **Bone**: Ivory, decayed, ash tones from ossuaries
 * - **Abyss**: Deep blacks and fog for darkness and shadows
 * 
 * @example
 * ```tsx
 * import { colors } from '@gravecast/grave-ui/tokens';
 * 
 * const tombstone = {
 *   backgroundColor: colors.crypt.stone,
 *   color: colors.bone.ivory,
 *   borderColor: colors.crypt.moss,
 * };
 * ```
 */
export const colors: ColorSystem = {
  /**
   * Crypt archetype - Weathered stone, moss, and granite tones
   * Used for: Tombstones, mausoleums, grave markers
   */
  crypt: {
    stone: '#16161a',
    slate: '#22232a',
    granite: '#343642',
    moss: '#3d5a45',
    lichen: '#5b8a68',
  },

  /**
   * Sanguine archetype - Blood and crimson tones from vampire folklore
   * Used for: Blood vials, vampire elements, danger states
   */
  sanguine: {
    blood: '#8a0303',
    crimson: '#bd081c',
    coagulated: '#4a0008',
    plasma: '#e63946',
  },

  /**
   * Witchcraft archetype - Dark magic, spectral, and curse tones
   * Used for: Cauldrons, grimoires, runic elements, magical effects
   */
  witchcraft: {
    cauldronVoid: '#0d0914',
    witchfire: '#8b5cf6',
    spectralEmerald: '#10b981',
    curseGold: '#d4af37',
  },

  /**
   * Bone archetype - Skeletal ivory, decayed, and ash tones
   * Used for: Skeleton elements, bone fences, ossuaries, text on dark
   */
  bone: {
    ivory: '#e8e0d5',
    decayed: '#b8a99a',
    ash: '#6b625b',
  },

  /**
   * Abyss archetype - Deep darkness, void, and fog
   * Used for: Backgrounds, overlays, shadows, void spaces
   */
  abyss: {
    black: '#060608',
    fog: 'rgba(18, 18, 24, 0.75)',
  },
} as const;

/**
 * Semantic color aliases for common UI states
 * Map archetype colors to standard UI patterns for easier adoption
 * 
 * @example
 * ```tsx
 * const button = {
 *   backgroundColor: semanticColors.primary,
 *   color: semanticColors.onPrimary,
 * };
 * ```
 */
export const semanticColors = {
  /** Primary brand color */
  primary: colors.witchcraft.witchfire,
  
  /** Primary text color */
  onPrimary: colors.bone.ivory,
  
  /** Danger/error state */
  danger: colors.sanguine.crimson,
  
  /** Success state */
  success: colors.witchcraft.spectralEmerald,
  
  /** Warning/caution state */
  warning: colors.witchcraft.curseGold,
  
  /** Main surface background */
  surface: colors.crypt.stone,
  
  /** Elevated surface (cards, modals) */
  surfaceElevated: colors.crypt.slate,
  
  /** Text on surface */
  onSurface: colors.bone.ivory,
  
  /** Secondary/muted text */
  onSurfaceMuted: colors.bone.decayed,
  
  /** Border/divider color */
  border: colors.crypt.granite,
  
  /** Overlay/backdrop */
  overlay: colors.abyss.fog,
} as const;

/**
 * Canonical flat palette, the single source of truth for raw color values.
 *
 * This mirrors exactly the CSS custom properties defined in
 * `src/styles/grave-ui.css` and the Tailwind utilities registered by the
 * Grave-UI plugin (`grave-dark-850`, `grave-mist-300`, etc.). Use this when a
 * raw hex value is needed in inline SVG `fill`/`stroke` or `style` props where
 * Tailwind utility classes cannot be applied.
 *
 * @example
 * ```tsx
 * import { palette } from 'groove-ui/tokens';
 *
 * <rect fill={palette.dark[850]} stroke={palette.crypt.granite} />
 * ```
 */
export const palette = {
  /** Crypt - weathered stone, moss, granite */
  crypt: {
    stone: '#16161a',
    slate: '#22232a',
    granite: '#343642',
    moss: '#3d5a45',
    lichen: '#5b8a68',
  },
  /** Sanguine - blood and crimson tones */
  sanguine: {
    blood: '#8a0303',
    crimson: '#bd081c',
    coagulated: '#4a0008',
    plasma: '#e63946',
  },
  /** Witchcraft - void, fire, emerald, curse gold */
  witch: {
    void: '#0d0914',
    fire: '#8b5cf6',
    emerald: '#10b981',
    gold: '#d4af37',
  },
  /**
   * Coven - the painted witch: sickly green skin, a near-black robe and hat
   * with a violet sheen, a yellow eye, and an old wooden broom bound with straw.
   */
  coven: {
    skin: '#7fae3e',
    skinShade: '#4f7a24',
    wart: '#5c8a2c',
    eye: '#f2d64b',
    pupil: '#2a0a06',
    robe: '#120f1a',
    robeSheen: '#2b2240',
    wood: '#7a4a22',
    woodShade: '#4a2a12',
    straw: '#d9b65a',
    strawShade: '#a07e32',
    twine: '#5a3818',
    ink: '#050407',
  },
  /**
   * Haunt - the glow each grave gives off in the graveyard, by how serious its
   * finding is. Always shown with weathering and a label, never on its own.
   */
  haunt: {
    /** Serious: dried blood. */
    serious: '#c46a5f',
    /** Risky: faded plum. */
    risky: '#8f7aa6',
    /** Unusual: tarnished brass. */
    unusual: '#b39556',
    /** A note: grey-green lichen. */
    note: '#82a197',
  },
  /** Soil - a graveyard's worn ground: dark earth, dead grass, fallen leaves and loose stones. */
  soil: {
    /** Damp earth, the ground's base. */
    dark: '#15130f',
    /** Turned earth, browner. */
    loam: '#2b2218',
    /** Old moss in the shade. */
    moss: '#1f2a1a',
    /** Dead grass, straw-grey. */
    deadGrass: '#5a5638',
    /** Grass that is still barely alive. */
    grass: '#2f3b22',
    /** Fallen leaves. */
    leafRust: '#5e2e1a',
    leafOchre: '#6e5326',
    leafBrown: '#3b2a1c',
    /** Loose stones and grit. */
    pebble: '#4a4842',
    grit: '#6b675e',
  },
  /** Bone - ivory through ash */
  bone: {
    100: '#f5f2eb',
    200: '#e8e0d5',
    300: '#d6ccbe',
    decayed: '#b8a99a',
    ash: '#6b625b',
  },
  /** Abyss & neutral darks (background/surface scale) */
  dark: {
    950: '#060608',
    900: '#0a0a0f',
    850: '#0f1017',
    800: '#14151f',
    750: '#1b1c29',
    700: '#222434',
    600: '#2e3146',
  },
  /** Mist & text tones */
  mist: {
    100: '#e2e4ed',
    200: '#c2c5d4',
    300: '#9da1b6',
    400: '#6d7186',
    500: '#4a4d60',
  },
  /**
   * Grove - the green-tinted night of the docs: darks, mist and bone with a
   * touch of moss, and one emerald for the living light. Use it through the
   * `.grave-grove` class, which swaps the dark, mist and bone scales.
   */
  grove: {
    950: '#060c09',
    900: '#08120e',
    850: '#0c1813',
    800: '#10211a',
    750: '#152b22',
    700: '#1b382b',
    600: '#264a3a',
    mist100: '#e2ece7',
    mist200: '#c1d5cb',
    mist300: '#9cb8a9',
    mist400: '#6d887a',
    mist500: '#496356',
    bone100: '#f4f7f4',
    bone200: '#e2ede6',
    bone300: '#cbdcd1',
    /** The living light: lanterns, the vial, the active step. */
    glow: '#34d399',
    /** A soft sage: the one accent on calm screens (main action, current item). */
    sage: '#a9c8b2',
    /** Dull brass: only for what needs attention (waiting, offline, an error). */
    brass: '#cdb27a',
  },
} as const;

/**
 * Mixes a color with transparency, so any token can be used as a soft
 * overlay or tint. Produces a CSS `color-mix()` value.
 *
 * @example
 * ```tsx
 * <div style={{ background: withAlpha(palette.witch.fire, 20) }} />
 * ```
 *
 * @param color - Any CSS color, usually a palette token.
 * @param percent - How much of the color to keep, from 0 (invisible) to 100 (solid).
 */
export const withAlpha = (color: string, percent: number): string =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;
