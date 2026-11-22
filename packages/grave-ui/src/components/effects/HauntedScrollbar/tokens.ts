/**
 * HauntedScrollbar design tokens
 * @module components/effects/HauntedScrollbar/tokens
 */

export type HauntedScrollbarVariant = 'ectoplasm' | 'blood' | 'void';

export interface ScrollbarTheme {
  primary: string;
  core: string;
  dark: string;
  glow: string;
  trail: string;
  eyeIris: string;
  eyePupil: string;
}

export const hauntedScrollbarThemes: Record<HauntedScrollbarVariant, ScrollbarTheme> = {
  ectoplasm: {
    primary: '#10b981',
    core: '#34d399',
    dark: '#064e3b',
    glow: '0 0 14px rgba(16, 185, 129, 0.65), 0 0 28px rgba(16, 185, 129, 0.35)',
    trail: 'rgba(16, 185, 129, 0.2)',
    eyeIris: '#a7f3d0',
    eyePupil: '#022c22',
  },
  blood: {
    primary: '#bd081c',
    core: '#ef4444',
    dark: '#450a0a',
    glow: '0 0 14px rgba(239, 68, 68, 0.65), 0 0 28px rgba(189, 8, 28, 0.35)',
    trail: 'rgba(189, 8, 28, 0.2)',
    eyeIris: '#fecaca',
    eyePupil: '#450a0a',
  },
  void: {
    primary: '#8b5cf6',
    core: '#a78bfa',
    dark: '#1e1b4b',
    glow: '0 0 14px rgba(139, 92, 246, 0.65), 0 0 28px rgba(139, 92, 246, 0.35)',
    trail: 'rgba(139, 92, 246, 0.2)',
    eyeIris: '#ddd6fe',
    eyePupil: '#1e1b4b',
  },
};

export const hauntedScrollbarTokens = {
  trackWidth: 10,
  blobWidth: 14,
  blobBaseHeight: 46,
  minHeight: 28,
  maxHeight: 120,
  eyeSize: 6,
  snapDistance: 50,
  maxStretch: 2.2,
  stretchVelocityFactor: 0.045,
  springTension: 0.16,
  springDamping: 0.78,
  idleFadeMs: 1400,
  zIndex: 9999,
} as const;

