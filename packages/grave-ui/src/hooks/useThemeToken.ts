/**
 * useThemeToken - Helper hook for accessing tokens with fallbacks
 * @module hooks/useThemeToken
 */

import { useMemo } from 'react';

/**
 * Token path type for type-safe token access
 */
export type TokenPath = string;

/**
 * Reusable hook for safely accessing design tokens with fallbacks.
 * 
 * Provides a type-safe way to access tokens dynamically with fallback values.
 * Useful for theming and runtime token selection.
 * 
 * @example
 * ```tsx
 * import { colors } from '@gravecast/grave-ui/tokens';
 * 
 * const MyComponent = ({ colorKey = 'crypt.stone' }) => {
 *   const bgColor = useThemeToken(
 *     () => colors.crypt.stone,
 *     colors.abyss.black // fallback
 *   );
 *   
 *   return <div style={{ backgroundColor: bgColor }}>Content</div>;
 * };
 * ```
 * 
 * @example Dynamic token access
 * ```tsx
 * const intensity = 'high';
 * const shadow = useThemeToken(
 *   () => intensity === 'high' ? shadows.depths.abyssal : shadows.depths.ethereal,
 *   shadows.depths.spectral
 * );
 * ```
 * 
 * @param tokenAccessor - Function that returns the token value
 * @param fallback - Fallback value if accessor fails
 * @returns Token value or fallback
 */
export const useThemeToken = <T = string>(
  tokenAccessor: () => T,
  fallback: T
): T => {
  return useMemo(() => {
    try {
      return tokenAccessor();
    } catch (error) {
      console.warn('[Grave-UI] Token access failed, using fallback:', error);
      return fallback;
    }
  }, [tokenAccessor, fallback]);
};

/**
 * Helper to create a memoized token getter for a specific token path
 * 
 * @example
 * ```tsx
 * const getColor = createTokenGetter(colors);
 * 
 * const MyComponent = ({ archetype = 'crypt' }) => {
 *   const color = getColor(`${archetype}.stone`, colors.abyss.black);
 *   return <div style={{ color }}>Content</div>;
 * };
 * ```
 */
export const createTokenGetter = <T extends Record<string, any>>(tokenObject: T) => {
  return (path: string, fallback: any): any => {
    const keys = path.split('.');
    let value: any = tokenObject;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    
    return value ?? fallback;
  };
};
