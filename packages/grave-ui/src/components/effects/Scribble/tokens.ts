/**
 * Scribble tokens: ink colors, line widths, and the toolbar's look.
 * @module components/effects/Scribble/tokens
 */

import { palette } from '../../../tokens';

/** The inks offered by default, with names for screen readers. */
export const SCRIBBLE_INKS: readonly { name: string; color: string }[] = [
  { name: 'Bone', color: palette.bone[100] },
  { name: 'Blood', color: palette.sanguine.plasma },
  { name: 'Witchfire', color: palette.witch.fire },
  { name: 'Ectoplasm', color: palette.witch.emerald },
  { name: 'Candle gold', color: palette.witch.gold },
  { name: 'Mist', color: palette.mist[300] },
];

/** Line widths offered, in px. */
export const SCRIBBLE_WIDTHS: readonly { name: string; value: number }[] = [
  { name: 'Thin', value: 2 },
  { name: 'Medium', value: 4 },
  { name: 'Bold', value: 8 },
];

/** How each stroke is drawn, beyond its color and width. */
export const scribbleStroke = {
  /** Highlighter lines are this many times wider than the chosen width. */
  highlighterScale: 3.5,
  /** And this see-through, from 0 to 1. */
  highlighterOpacity: 0.38,
  /** Text size is this many times the line width, never smaller than `textMin`. */
  textScale: 5,
  textMin: 16,
  /** Arrowheads: length as a multiple of the width (at least `arrowMin`), and spread in degrees. */
  arrowScale: 4,
  arrowMin: 12,
  arrowSpread: 28,
  /** How far a sketchy line wanders from the true line, as a multiple of the width (at least `sketchMin`). */
  sketchScale: 0.9,
  sketchMin: 1.5,
  /** Points closer than this, in px, are merged as the pen moves. */
  minPointGap: 1.5,
  /** How close the eraser must pass, in px, beyond the stroke's own half-width. */
  eraserReach: 8,
  /** Corners in a drawn ellipse. */
  ellipseSegments: 48,
  /** Shapes kept, so the page stays quick. Older shapes are dropped first. */
  maxShapes: 2000,
  /** Undo steps kept. */
  maxHistory: 100,
} as const;

/** The toolbar and launcher. */
export const scribbleChrome = {
  panel: palette.dark[900],
  panelBorder: palette.dark[600],
  raised: palette.dark[750],
  text: palette.bone[200],
  muted: palette.mist[300],
  active: palette.witch.fire,
  danger: palette.sanguine.plasma,
  /** Shading behind the toolbar so it lifts off busy pages. */
  shadow: '0 10px 30px rgba(0, 0, 0, 0.55)',
  radius: '0.75rem',
  buttonRadius: '0.5rem',
  /** Tool buttons and swatches are at least this big, for touch. */
  buttonSize: '2.25rem',
  swatchSize: '1.25rem',
  iconSize: 18,
  gap: '0.25rem',
  padding: '0.375rem',
  /** Space between the toolbar or launcher and the edge of the drawing area. */
  inset: '0.75rem',
  divider: '1px',
  focusRing: '2px',
  /** How strongly the accent tints a hovered or a pressed button, in percent. */
  hoverTint: 12,
  pressedTint: 24,
  /** How faded unavailable buttons are, from 0 to 1. */
  disabledOpacity: 0.4,
  font: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontSize: '0.75rem',
} as const;
