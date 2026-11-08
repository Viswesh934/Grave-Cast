/**
 * Type definitions for Grave-UI design tokens
 * @module tokens/types
 */

/**
 * Color value in hex format
 */
export type ColorValue = string;

/**
 * Shadow definition with offset, blur, spread, and color
 */
export interface ShadowToken {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread?: string;
  color: string;
  inset?: boolean;
}

/**
 * CSS shadow string
 */
export type ShadowValue = string;

/**
 * Horror intensity levels for progressive enhancement
 */
export type HorrorIntensity = 'ghastly' | 'cursed' | 'abyssal';

/**
 * Archetype-specific color palettes
 */
export interface ArchetypeColors {
  [key: string]: ColorValue;
}

/**
 * Complete color system organized by archetype
 */
export interface ColorSystem {
  crypt: ArchetypeColors;
  sanguine: ArchetypeColors;
  witchcraft: ArchetypeColors;
  bone: ArchetypeColors;
  abyss: ArchetypeColors;
}

/**
 * Shadow system organized by depth and effect type
 */
export interface ShadowSystem {
  depths: {
    ethereal: ShadowValue;
    spectral: ShadowValue;
    abyssal: ShadowValue;
  };
  glows: {
    eldritch: ShadowValue;
    blood: ShadowValue;
    moonlight: ShadowValue;
  };
}
