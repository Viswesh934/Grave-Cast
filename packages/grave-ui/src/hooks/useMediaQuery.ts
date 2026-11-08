/**
 * useMediaQuery - Reusable media query hook for responsive behavior
 * @module hooks/useMediaQuery
 */

import { useState, useEffect } from 'react';

/**
 * Common breakpoint queries
 */
export const breakpoints = {
  /** Mobile: 640px and below */
  mobile: '(max-width: 640px)',
  /** Tablet: 641px to 1024px */
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  /** Desktop: 1025px and above */
  desktop: '(min-width: 1025px)',
  /** Prefer reduced motion */
  reducedMotion: '(prefers-reduced-motion: reduce)',
  /** Prefer dark color scheme */
  darkMode: '(prefers-color-scheme: dark)',
} as const;

/**
 * Reusable hook for responsive design based on media queries.
 * 
 * Listens to media query changes and returns boolean match state.
 * Handles SSR-safe initial state.
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * 
 * return (
 *   <div>
 *     {isMobile ? 'Mobile View' : 'Desktop View'}
 *   </div>
 * );
 * ```
 * 
 * @example Using predefined breakpoints
 * ```tsx
 * import { useMediaQuery, breakpoints } from '@gravecast/grave-ui/hooks';
 * 
 * const isMobile = useMediaQuery(breakpoints.mobile);
 * const prefersReducedMotion = useMediaQuery(breakpoints.reducedMotion);
 * ```
 * 
 * @param query - CSS media query string
 * @returns Boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  // Initialize with false for SSR safety
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers use addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};
