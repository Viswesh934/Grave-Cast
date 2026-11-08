/**
 * Shadow tokens for Grave-UI
 * Organized by depth levels and glow effects for horror atmosphere
 * @module tokens/shadows
 */

import type { ShadowSystem } from './types';
import { colors } from './colors';

/**
 * Shadow system for depth and atmospheric effects.
 * 
 * - **Depths**: Elevation shadows for cards, modals, elevated surfaces
 * - **Glows**: Magical/supernatural glow effects for horror elements
 * 
 * @example
 * ```tsx
 * import { shadows } from '@gravecast/grave-ui/tokens';
 * 
 * const card = {
 *   boxShadow: shadows.depths.spectral,
 * };
 * 
 * const runeButton = {
 *   boxShadow: shadows.glows.eldritch,
 * };
 * ```
 */
export const shadows: ShadowSystem = {
  /**
   * Depth shadows - Elevation and layering
   * Used for: Cards, modals, popovers, elevated surfaces
   */
  depths: {
    /** Subtle elevation - hovering just above surface */
    ethereal: `0 2px 8px ${colors.abyss.black}`,
    
    /** Medium elevation - cards and panels */
    spectral: `0 4px 16px ${colors.abyss.black}, 0 2px 4px rgba(0, 0, 0, 0.3)`,
    
    /** Deep elevation - modals and major overlays */
    abyssal: `0 8px 32px ${colors.abyss.black}, 0 4px 8px rgba(0, 0, 0, 0.5)`,
  },

  /**
   * Glow effects - Supernatural and magical lighting
   * Used for: Active states, magical elements, horror accents
   */
  glows: {
    /** Purple witch-fire glow for magical elements */
    eldritch: `0 0 16px ${colors.witchcraft.witchfire}, 0 0 4px ${colors.witchcraft.witchfire}`,
    
    /** Crimson blood glow for danger/vampire elements */
    blood: `0 0 12px ${colors.sanguine.crimson}, 0 0 4px ${colors.sanguine.blood}`,
    
    /** Pale green moonlight glow for spectral elements */
    moonlight: `0 0 16px ${colors.witchcraft.spectralEmerald}, 0 0 6px rgba(16, 185, 129, 0.6)`,
  },
} as const;

/**
 * Shadow utilities for common UI patterns
 * Pre-composed shadows for frequent use cases
 */
export const shadowUtils = {
  /** No shadow */
  none: 'none',
  
  /** Inner shadow for inset/pressed effects */
  inset: `inset 0 2px 4px ${colors.abyss.black}`,
  
  /** Text shadow for readability on busy backgrounds */
  textGlow: `0 1px 2px ${colors.abyss.black}, 0 0 8px ${colors.abyss.black}`,
  
  /** Combine depth + glow for elevated magical elements */
  spectralEldritch: `${shadows.depths.spectral}, ${shadows.glows.eldritch}`,
  
  /** Combine depth + blood glow for vampire cards */
  spectralBlood: `${shadows.depths.spectral}, ${shadows.glows.blood}`,
} as const;
