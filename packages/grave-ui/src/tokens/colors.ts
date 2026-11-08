/**
 * Color tokens for Grave-UI
 * Organized by horror archetype with folklore-inspired palettes
 * @module tokens/colors
 */

import type { ColorSystem } from './types.js';

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
