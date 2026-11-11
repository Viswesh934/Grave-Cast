/**
 * useIsomorphicLayoutEffect - A layout effect that is safe during server rendering
 * @module hooks/useIsomorphicLayoutEffect
 */

import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser and `useEffect` on the server, so code that
 * must run before paint does not print a warning during server rendering.
 *
 * @example
 * ```tsx
 * useIsomorphicLayoutEffect(() => {
 *   measure(ref.current);
 * }, []);
 * ```
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
