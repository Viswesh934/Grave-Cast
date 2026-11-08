/**
 * Typography tokens for Grave-UI
 * Font families, type scales, and text treatments inspired by horror typography
 * @module tokens/typography
 */

/**
 * Typography system for horror-themed text treatments.
 * 
 * - **Font families**: Folklore-appropriate type stacks
 * - **Type scale**: Horror-themed size names
 * - **Text treatments**: Letter spacing, transforms, and decorative styles
 * 
 * @example
 * ```tsx
 * import { typography } from '@gravecast/grave-ui/tokens';
 * 
 * const epitaph = {
 *   fontFamily: typography.families.epitaph,
 *   fontSize: typography.scale.incantation,
 *   letterSpacing: typography.letterSpacing.wide,
 * };
 * ```
 */
export const typography = {
  /**
   * Font family stacks for different horror contexts
   * Fallback to system fonts for reliability
   */
  families: {
    /** Monospace for tombstone epitaphs and technical text */
    epitaph: '"SF Mono", "Courier New", Courier, monospace',
    
    /** Serif for grimoires, ancient texts, and formal content */
    grimoire: 'Georgia, "Times New Roman", Times, serif',
    
    /** Monospace bold for runic inscriptions and mystical symbols */
    runic: '"JetBrains Mono", "SF Mono", Consolas, monospace',
    
    /** Sans-serif for modern UI elements and body text */
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  /**
   * Type scale with horror-appropriate naming
   * Sizes progress from whispers to proclamations
   */
  scale: {
    /** Tiny text - 10px - barely visible whispers */
    whisper: '0.625rem',
    
    /** Small text - 12px - quiet murmurs */
    murmur: '0.75rem',
    
    /** Caption text - 14px - faint voices */
    voice: '0.875rem',
    
    /** Body text - 16px - normal speech */
    speech: '1rem',
    
    /** Emphasis - 18px - incantations */
    incantation: '1.125rem',
    
    /** Subheading - 20px - ritual chants */
    chant: '1.25rem',
    
    /** Heading - 24px - proclamations */
    proclamation: '1.5rem',
    
    /** Large heading - 32px - thunderous declarations */
    declaration: '2rem',
    
    /** Display - 48px - ominous titles */
    omen: '3rem',
    
    /** Hero - 64px - monolithic inscriptions */
    monolith: '4rem',
  },

  /**
   * Letter spacing for different text treatments
   */
  letterSpacing: {
    /** Tight spacing for compact text */
    tight: '-0.025em',
    
    /** Normal spacing */
    normal: '0',
    
    /** Wide spacing for epitaphs and emphasis */
    wide: '0.05em',
    
    /** Extra wide for monumental inscriptions */
    wider: '0.1em',
    
    /** Extreme spacing for dramatic effect */
    widest: '0.15em',
  },

  /**
   * Line heights for readability and atmosphere
   */
  lineHeight: {
    /** Tight for headings and compact layouts */
    tight: '1.2',
    
    /** Normal for most text */
    normal: '1.5',
    
    /** Relaxed for long-form content */
    relaxed: '1.75',
    
    /** Loose for dramatic spacing */
    loose: '2',
  },

  /**
   * Font weights
   */
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  /**
   * Text transforms for stylistic treatments
   */
  transform: {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    none: 'none',
  },

  /**
   * Pre-composed text styles for common patterns
   */
  styles: {
    /** Tombstone epitaph style */
    epitaph: {
      fontFamily: '"SF Mono", "Courier New", Courier, monospace',
      fontSize: '0.875rem',
      fontWeight: '400',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      lineHeight: '1.5',
    },
    
    /** Ancient grimoire text */
    grimoire: {
      fontFamily: 'Georgia, "Times New Roman", Times, serif',
      fontSize: '1rem',
      fontWeight: '400',
      fontStyle: 'italic',
      letterSpacing: '0',
      lineHeight: '1.75',
    },
    
    /** Mystical runic inscription */
    runic: {
      fontFamily: '"JetBrains Mono", "SF Mono", Consolas, monospace',
      fontSize: '1rem',
      fontWeight: '600',
      letterSpacing: '0.05em',
      lineHeight: '1.5',
    },
    
    /** Body text for content */
    body: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '1rem',
      fontWeight: '400',
      letterSpacing: '0',
      lineHeight: '1.5',
    },
  },
} as const;
