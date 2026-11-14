/**
 * Doodle tokens: ink, line weights, canvas size, figure proportions, and the
 * strip player's look. Calm by design: soft bone silhouettes on dark, one muted accent.
 * @module components/effects/Doodle/tokens
 */
import { palette, typography } from '../../../tokens';

/** Colors for every doodle. */
export const doodleInk = {
  /** Figures and props. */
  line: palette.bone[200],
  /** The one detail the eye should go to. */
  accent: palette.crypt.lichen,
  /** Badge and label text. */
  text: palette.bone[200],
  /** The ground line and other quiet marks. */
  quiet: palette.mist[500],
  /** The thin outline that separates overlapping figures. Matches the surface behind doodles. */
  halo: palette.dark[900],
} as const;

/** Line weights (in viewBox units) and how hand-drawn the lines look. */
export const doodleStroke = {
  /** Arms and legs: thick, with rounded ends and joints. */
  limb: 5.5,
  /** The torso: one rounded capsule from shoulders to hips. */
  torso: 10,
  /** How far the separating outline reaches past a figure, on each side. */
  halo: 1.8,
  prop: 1.8,
  ground: 1,
  accent: 2,
  /** Limbs on the far side of a figure are drawn fainter, for depth. */
  farOpacity: 0.5,
  /** Smaller figures get thinner limbs, but never thinner than this share of an adult's. */
  minScale: 0.55,
  /** Rough.js settings: kept low so shapes stay crisp, with a little hand-inked warmth. */
  roughness: 0.6,
  bowing: 0.5,
} as const;

/** The drawing area every doodle uses unless it sets its own. */
export const doodleCanvas = {
  width: 200,
  height: 140,
  /** Where the ground line sits, measured up from the bottom edge. */
  groundInset: 12,
} as const;

/**
 * Figure proportions. Poses are written for an adult 100 units tall, standing
 * on the ground at y = 0, facing left. Smaller sizes scale the body and draw a
 * relatively larger head.
 */
export const doodleFigure = {
  headRadius: 7,
  /** The small gap between the head and the shoulders. */
  neckGap: 2.5,
  sizes: {
    adult: { scale: 1, head: 1 },
    child: { scale: 0.7, head: 1.15 },
    infant: { scale: 0.42, head: 1.4 },
  },
} as const;

/** Text inside badges and labels. */
export const doodleText = {
  size: 9,
  family: typography.families.body,
  /** Generous width of one character, as a multiple of the text size, so labels never spill out. */
  charWidth: 0.72,
  badgePadding: 4,
  badgeHeight: 14,
} as const;

/** The highlight drawn around the key detail. */
export const doodleHighlight = {
  radius: 9,
} as const;

/** Drawing and movement timing. */
export const doodleMotion = {
  /** How long one line takes to draw itself. */
  drawMs: 600,
  /** The pause before each next line starts. */
  staggerMs: 60,
  /** One push for a `push` figure: about 110 per minute, inside the 100–120 CPR range. */
  pushMs: 545,
  /** How far a pushing figure moves, in viewBox units. */
  pushDistance: 2,
} as const;

/** The strip player's frame. */
export const doodleChrome = {
  surface: palette.dark[900],
  border: palette.dark[700],
  borderWidth: '1px',
  text: palette.bone[200],
  muted: palette.mist[300],
  radius: '0.75rem',
  padding: '1rem',
  gap: '0.75rem',
  captionSize: '1.05rem',
  captionLineHeight: 1.5,
  smallSize: '0.85rem',
  font: typography.families.body,
} as const;

/** The comic page: every panel at once, framed and numbered, read without tapping. */
export const doodleComic = {
  /** Panels sit side by side when there is room, and stack on narrow screens. */
  panelMinWidth: '11rem',
  /** The gutter between panels. */
  gutter: '0.75rem',
  panelBorder: palette.mist[500],
  panelBorderWidth: '2px',
  panelRadius: '0.375rem',
  panelSurface: palette.dark[900],
  /** The caption box under each drawing. */
  captionSurface: palette.dark[850],
  captionPadding: '0.6rem 0.75rem',
  /** The panel number in the top-left corner. */
  badgeSize: '1.6rem',
  badgeSurface: palette.bone[200],
  badgeText: palette.dark[900],
  badgeFontSize: '0.85rem',
} as const;
