/**
 * GameDialog tokens: the window a small game opens in, in the grove palette.
 * @module components/effects/GameDialog/tokens
 */
import { palette, typography, withAlpha, zLayers } from '../../../tokens';

export const gameDialogTokens = {
  /** The dark over the page behind the game. */
  backdrop: withAlpha(palette.grove[950], 90),
  panel: palette.grove[850],
  panelEdge: palette.grove[600],
  text: palette.grove.bone100,
  muted: palette.grove.mist300,
  /** The one accent: the numbers in the score line. */
  accent: palette.grove.glow,
  zIndex: zLayers.modal,
  font: typography.families.grimoire,
  labelFont: typography.families.epitaph,
  width: '46rem',
  padding: '1.25rem',
  gap: '0.85rem',
  radius: '0.75rem',
  borderWidth: '1px',
  titleSize: '1.6rem',
  textSize: '1rem',
  labelSize: '0.72rem',
  labelTracking: '0.2em',
  /** The message laid over a game before it starts, while paused, and when it ends. */
  overlay: withAlpha(palette.grove[950], 75),
  closeIconSize: '0.9rem',
  closeIconStroke: 2,
  /** A game icon on a button, such as the ghost. */
  iconSize: '1.25rem',
  /** The icon on a message's button, such as play or play again. Large, as it is the one thing to press. */
  actionIconSize: '1.75rem',
} as const;
