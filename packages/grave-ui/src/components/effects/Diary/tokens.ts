/**
 * Diary tokens: an old book on a dark night. Bone ink on a dark ruled page,
 * one muted accent, and slow, quiet motion.
 * @module components/effects/Diary/tokens
 */
import { palette, typography, withAlpha, zLayers } from '../../../tokens';

export const diaryTokens = {
  /** The dark that falls over the page behind the book. */
  backdrop: withAlpha(palette.dark[950], 90),
  /** The leather cover around the page. */
  cover: palette.dark[750],
  coverEdge: palette.dark[600],
  /** The page and its faint ruled lines. */
  page: palette.dark[850],
  rule: palette.dark[700],
  /** The diary's handwriting. */
  ink: palette.bone[200],
  /** Your own writing, a little fainter. */
  inkYours: palette.mist[300],
  /** Small labels such as "Entity awake". */
  label: palette.mist[400],
  /** The one muted accent: the awake mark. */
  accent: palette.crypt.lichen,
  zIndex: zLayers.modal,

  font: typography.families.grimoire,
  labelFont: typography.families.epitaph,
  textSize: '1.4rem',
  labelSize: '0.72rem',
  lineHeight: 1.7,
  /** Space between ruled lines, matched to the line height. */
  ruleGap: '2.38rem',

  width: '36rem',
  padding: '2.5rem 2.75rem',
  coverPadding: '0.85rem',
  radius: '0.35rem',
  gap: '1.25rem',
  borderWidth: '1px',

  /** The title row: space between its parts, and how wide its letters sit. */
  labelGap: '0.6em',
  labelTracking: '0.2em',
  /** The small round "awake" mark. */
  markSize: '0.5em',
  /** The writing field. */
  fieldGap: '0.35rem',
  fieldMinWidth: '14rem',
  fieldTracking: '0.12em',
  fieldPadding: '0.35rem 0',
  focusOffset: '0.25rem',
  /** Space between choice buttons. */
  choiceGap: '0.75rem',
  /** The close button's cross: its size, and how thick its two strokes are. */
  closeIconSize: '0.9rem',
  closeIconStroke: 2,

  /** How fast the diary writes. Slow on purpose: it is choosing its words. */
  charsPerSecond: 34,
  /** How long the book takes to appear, and to vanish. */
  awakenMs: 700,
  vanishMs: 1100,
  /** The pause after a reply is written before the exchange counts as over. */
  lingerMs: 900,
  /** How the book rises in: from slightly low, small, and blurred. */
  awakenRise: '0.75rem',
  awakenScale: 0.98,
  awakenBlur: '6px',
  /** How it vanishes: shrinking and blurring away. */
  vanishScale: 0.95,
  vanishBlur: '12px',
  /** The awake mark breathes this slowly, dimming to this opacity. */
  markPulseMs: 3000,
  markDim: 0.35,
  /** Your answer sinks into the page as the diary replies. */
  sinkMs: 2400,
  sinkOpacity: 0.25,
  sinkBlur: '0.6px',
} as const;
