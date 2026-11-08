import { useState, useEffect } from 'react';

/**
 * WebGL capability detection result
 */
export interface WebGLCapability {
  available: boolean;
  version?: 1 | 2;
  error?: string;
}

/**
 * Detects if 3D horror components should fallback to 2D rendering
 * 
 * Checks:
 * - User prefers reduced motion
 * - WebGL availability
 * - Manual override prop
 * 
 * @param manualFallback - Force fallback mode regardless of capabilities
 * @returns Boolean indicating if fallback should be used
 * 
 * @example
 * ```tsx
 * const shouldFallback = useHorrorFallback();
 * return shouldFallback ? <Simple2DComponent /> : <3DComponent />;
 * ```
 */
export function useHorrorFallback(manualFallback?: boolean): boolean {
  const [shouldFallback, setShouldFallback] = useState<boolean>(false);

  useEffect(() => {
    // Manual override takes precedence
    if (manualFallback !== undefined) {
      setShouldFallback(manualFallback);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check WebGL availability
    const webgl = detectWebGL();

    setShouldFallback(prefersReducedMotion || !webgl.available);
  }, [manualFallback]);

  return shouldFallback;
}

/**
 * Detects WebGL support and version
 * 
 * @returns WebGL capability information
 */
export function detectWebGL(): WebGLCapability {
  try {
    const canvas = document.createElement('canvas');
    
    // Try WebGL 2 first
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      return { available: true, version: 2 };
    }

    // Fallback to WebGL 1
    const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl1) {
      return { available: true, version: 1 };
    }

    return { 
      available: false, 
      error: 'WebGL not supported by browser' 
    };
  } catch (e) {
    return { 
      available: false, 
      error: e instanceof Error ? e.message : 'WebGL detection failed' 
    };
  }
}
