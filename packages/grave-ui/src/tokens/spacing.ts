/**
 * Spacing tokens for Grave-UI
 * Coven-scale spacing system (4px base) for consistent layout rhythm
 * @module tokens/spacing
 */

/**
 * Spacing scale based on multiples of 4 (the coven number).
 * 
 * Uses the "coven scale" naming for thematic consistency.
 * Provides consistent spacing rhythm across all components.
 * 
 * @example
 * ```tsx
 * import { spacing } from '@gravecast/grave-ui/tokens';
 * 
 * const card = {
 *   padding: spacing.coven[4],      // 16px
 *   marginBottom: spacing.coven[6], // 24px
 *   gap: spacing.coven[3],          // 12px
 * };
 * ```
 */
export const spacing = {
  /**
   * Coven scale - multiples of 4px
   * Named with mystical numbers for thematic consistency
   */
  coven: {
    /** 0px - No space */
    0: '0',
    
    /** 4px - Minimal space */
    1: '0.25rem',
    
    /** 8px - Tight space */
    2: '0.5rem',
    
    /** 12px - Compact space */
    3: '0.75rem',
    
    /** 16px - Standard space (1rem baseline) */
    4: '1rem',
    
    /** 20px - Comfortable space */
    5: '1.25rem',
    
    /** 24px - Generous space */
    6: '1.5rem',
    
    /** 32px - Large space */
    8: '2rem',
    
    /** 40px - Extra large space */
    10: '2.5rem',
    
    /** 48px - Section spacing */
    12: '3rem',
    
    /** 64px - Major section spacing */
    16: '4rem',
    
    /** 96px - Hero spacing */
    24: '6rem',
    
    /** 128px - Monumental spacing */
    32: '8rem',
  },

  /**
   * Semantic spacing aliases for common use cases
   */
  semantic: {
    /** Internal padding for buttons, inputs */
    inset: '0.75rem', // 12px
    
    /** Standard gap between related elements */
    gap: '1rem', // 16px
    
    /** Stack spacing for vertical rhythms */
    stack: '1.5rem', // 24px
    
    /** Gutter spacing for grid layouts */
    gutter: '2rem', // 32px
    
    /** Section spacing between major blocks */
    section: '4rem', // 64px
  },
} as const;
