/**
 * Keyframes for HorrorBackground.
 *
 * The names are prefixed `grave-bg-` so they never clash with the shared
 * stylesheet, and they are injected with the component so it works without
 * importing any CSS. Motion is switched off by `data-motion="off"` on the
 * root, which covers both `paused` and `prefers-reduced-motion`.
 *
 * @module components/effects/HorrorBackground/styles
 */

import { BACKGROUND_CLASS } from './tokens';

/** Names of the animations, so layers never mistype them. */
export const bgAnimation = {
  fogDrift: 'grave-bg-fog-drift',
  rain: 'grave-bg-rain',
  flash: 'grave-bg-flash',
  bolt: 'grave-bg-bolt',
  flicker: 'grave-bg-flicker',
  spin: 'grave-bg-spin',
  spinReverse: 'grave-bg-spin-reverse',
  pulse: 'grave-bg-pulse',
  tunnel: 'grave-bg-tunnel',
} as const;

/** CSS custom property that carries the rain tile height to its animation. */
export const RAIN_TILE_VAR = '--grave-bg-rain-tile';

export const backgroundKeyframes = `
@keyframes ${bgAnimation.fogDrift} {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes ${bgAnimation.rain} {
  from { -webkit-mask-position: 0 0; mask-position: 0 0; }
  to { -webkit-mask-position: 0 var(${RAIN_TILE_VAR}); mask-position: 0 var(${RAIN_TILE_VAR}); }
}
@keyframes ${bgAnimation.flash} {
  0%, 90%, 100% { opacity: 0; }
  91% { opacity: 0.9; }
  92.5% { opacity: 0.05; }
  94% { opacity: 0.7; }
  96% { opacity: 0; }
}
@keyframes ${bgAnimation.bolt} {
  0%, 90%, 100% { opacity: 0; }
  91% { opacity: 1; }
  92.5% { opacity: 0; }
  94% { opacity: 0.9; }
  96% { opacity: 0; }
}
@keyframes ${bgAnimation.flicker} {
  0%, 100% { opacity: 0.8; }
  8% { opacity: 0.55; }
  15% { opacity: 0.9; }
  27% { opacity: 0.65; }
  41% { opacity: 1; }
  52% { opacity: 0.7; }
  66% { opacity: 0.95; }
  79% { opacity: 0.6; }
}
@keyframes ${bgAnimation.spin} {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes ${bgAnimation.spinReverse} {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}
@keyframes ${bgAnimation.pulse} {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
@keyframes ${bgAnimation.tunnel} {
  0% { transform: scale(0.02); opacity: 0; }
  12% { opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}
.${BACKGROUND_CLASS}[data-motion="off"] * {
  animation: none !important;
}
`;
