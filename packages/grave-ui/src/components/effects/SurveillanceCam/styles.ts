/**
 * SurveillanceCam styles: keyframes and the overlay styles that sit on the picture.
 *
 * @module components/effects/SurveillanceCam/styles
 */

import type { CSSProperties } from 'react';
import { withAlpha } from '../HorrorBackground/tokens';
import { camAnimations, camTokens, type CamIntensityToken } from './tokens';

const { grain, glitch, scanlines, colors, rec } = camTokens;

const GRAIN_JUMP_COUNT = grain.jumps.length;
const PERCENT = 100;

const grainFrames = grain.jumps
  .map(([x, y], index) => `${(index / GRAIN_JUMP_COUNT) * PERCENT}% { background-position: ${x}px ${y}px; }`)
  .join('\n');

/** Keyframes for the grain, the recording dot, and the glitch band. */
export const camKeyframes = `
@keyframes ${camAnimations.grain} {
${grainFrames}
}
@keyframes ${camAnimations.blink} {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: ${rec.dimmed}; }
}
@keyframes ${camAnimations.glitch} {
  0%, ${glitch.startAt}% { top: -${glitch.height}%; opacity: 0; }
  ${glitch.startAt + 1}% { opacity: 1; }
  ${glitch.endAt}% { top: ${PERCENT}%; opacity: 1; }
  ${glitch.endAt + 1}%, 100% { top: ${PERCENT}%; opacity: 0; }
}
`;

/** Shared by every overlay: covers the picture and never takes pointer events. */
export const overlayBase: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

/** Thin dark lines across the picture, like a CRT. */
export const scanlineStyle = (strength: number): CSSProperties => {
  const line = withAlpha(colors.base, strength);
  return {
    ...overlayBase,
    backgroundImage: `repeating-linear-gradient(to bottom, ${line} 0, ${line} ${scanlines.line}px, transparent ${scanlines.line}px, transparent ${scanlines.period}px)`,
  };
};

/** Dark corners, like a worn lens. */
export const vignetteStyle = (strength: number): CSSProperties => ({
  ...overlayBase,
  background: `radial-gradient(ellipse at center, transparent ${camTokens.vignetteClear}%, ${withAlpha(colors.base, strength)} 100%)`,
});

/** A tile of noise as an SVG, so no image file is needed. */
const grainImage = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${grain.tile}" height="${grain.tile}">` +
    `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${grain.frequency}" numOctaves="${grain.octaves}" stitchTiles="stitch"/></filter>` +
    `<rect width="100%" height="100%" filter="url(#n)"/></svg>`
)}")`;

/** Film grain that jumps around. Static when `animated` is false. */
export const grainStyle = (tone: CamIntensityToken, animated: boolean): CSSProperties => ({
  ...overlayBase,
  backgroundImage: grainImage,
  backgroundSize: `${grain.tile}px ${grain.tile}px`,
  mixBlendMode: 'overlay',
  opacity: tone.grain,
  animation: animated ? `${camAnimations.grain} ${grain.seconds}s steps(1) infinite` : undefined,
});

/** A pale band that sweeps down the picture now and then. */
export const glitchStyle = (tone: CamIntensityToken): CSSProperties => ({
  position: 'absolute',
  left: 0,
  right: 0,
  height: `${glitch.height}%`,
  top: `-${glitch.height}%`,
  pointerEvents: 'none',
  opacity: 0,
  background: `linear-gradient(to bottom, transparent, ${withAlpha(colors.glitch, tone.glitch)}, transparent)`,
  animation: `${camAnimations.glitch} ${glitch.seconds}s linear infinite`,
});
