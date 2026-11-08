import type { HorrorIntensity } from '../../tokens/types';

/**
 * 3D Horror Component Configuration
 * Centralized configuration for lighting, intensity, and visual parameters
 */

export interface HorrorLightConfig {
  baseIntensity: number;
  flickerAmount: number;
  flickerSpeed: number;
  color: string;
}

/**
 * Torchlight configurations by intensity level
 */
export const TORCHLIGHT_CONFIG: Record<HorrorIntensity, HorrorLightConfig> = {
  ghastly: {
    baseIntensity: 2.5,
    flickerAmount: 0.1,
    flickerSpeed: 3,
    color: '#ffddaa', // Warm candlelight
  },
  cursed: {
    baseIntensity: 2.0,
    flickerAmount: 0.3,
    flickerSpeed: 8,
    color: '#ff9944', // Amber torch
  },
  abyssal: {
    baseIntensity: 1.5,
    flickerAmount: 0.6,
    flickerSpeed: 15,
    color: '#4499ff', // Cold spectral blue
  },
};

/**
 * Global 3D scene constants
 */
export const SCENE_CONFIG = {
  lightDistance: 30,
  lightDecay: 2,
  dampingFactor: 0.1,
  cursorDepth: 5,
} as const;
