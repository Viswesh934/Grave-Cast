/**
 * The doodle data format. A doodle is plain data: named poses and props placed
 * on a small canvas, plus an optional highlight. Nothing here is drawn by hand.
 * @module components/effects/Doodle/types
 */
import type rough from 'roughjs';

/** The joints of a stick figure. "Near" limbs face the viewer; "far" limbs are drawn fainter. */
export const DOODLE_JOINTS = [
  'head',
  'neck',
  'shoulder',
  'elbowNear',
  'handNear',
  'elbowFar',
  'handFar',
  'hip',
  'kneeNear',
  'footNear',
  'kneeFar',
  'footFar',
] as const;
export type DoodleJoint = (typeof DOODLE_JOINTS)[number];

/** A point in viewBox units. y grows downward, as in SVG. */
export interface DoodlePoint {
  x: number;
  y: number;
}

/**
 * A pose: where each joint sits, for an adult 100 units tall standing on the
 * ground at y = 0 and facing left.
 */
export interface DoodlePose {
  joints: Readonly<Record<DoodleJoint, DoodlePoint>>;
  /** Which way the face points, in degrees: 0 right, 90 down, 180 left, 270 up. */
  face?: number;
}

export type DoodleFigureSize = 'adult' | 'child' | 'infant';

/** One stick figure in a doodle. */
export interface DoodleFigure {
  /** Who this is, such as `helper` or `victim`. Used in descriptions and checks. */
  role: string;
  /** A pose id from the registry, such as `kneeling_compressions`. */
  pose: string;
  /** Where the pose's origin (its point on the ground) sits. */
  x: number;
  /** Defaults to the ground line. */
  y?: number;
  size?: DoodleFigureSize;
  /** Poses face left; `right` mirrors the figure. */
  facing?: 'left' | 'right';
  /** `push` moves the figure gently up and down, as in chest compressions. */
  motion?: 'push';
}

/** One prop in a doodle. */
export interface DoodlePropPlacement {
  /** A prop id from the registry, such as `phone_sos`. */
  prop: string;
  x: number;
  y: number;
  scale?: number;
  /** Degrees, clockwise. */
  rotate?: number;
  /** Text for props that show some, such as a badge. */
  label?: string;
}

/** The one detail the eye should go to: a joint of a figure, or a prop. */
export type DoodleHighlight = { figure: number; joint: DoodleJoint } | { prop: number };

/** One drawing. */
export interface DoodleSpec {
  /** Also seeds the hand-drawn wobble, so the drawing is the same everywhere. */
  id: string;
  /** Overrides the seed taken from the id. */
  seed?: number;
  width?: number;
  height?: number;
  /** The ground line's y. `false` draws no ground. Defaults near the bottom edge. */
  ground?: number | false;
  /**
   * Drawn in order, so earlier figures sit behind later ones. Put the helper
   * first and the person being helped second, so the person stays readable.
   */
  figures?: readonly DoodleFigure[];
  props?: readonly DoodlePropPlacement[];
  highlight?: DoodleHighlight;
}

/** One step of a strip: a drawing and its caption. */
export interface DoodlePanel {
  id: string;
  /** The step, as real text. The drawing explains it and never replaces it. */
  caption: string;
  /** One sentence for screen readers, describing the drawing. */
  description: string;
  doodle: DoodleSpec;
}

/** Where a strip's steps come from. */
export interface DoodleSource {
  name: string;
  url?: string;
}

/** A comic strip: a titled set of panels, read in order. */
export interface DoodleStripSpec {
  id: string;
  title: string;
  panels: readonly DoodlePanel[];
  source?: DoodleSource;
  /** Whether the content has been checked against its source. */
  review?: 'draft' | 'verified';
}

/** Rough.js's generator, and what it draws. */
export type DoodleGenerator = ReturnType<typeof rough.generator>;
export type DoodleDrawable = ReturnType<DoodleGenerator['line']>;

/** Text drawn inside a prop, such as a badge's label. Coordinates are local to the prop. */
export interface DoodleLabel {
  x: number;
  y: number;
  text: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
}

/** What a prop is given to draw with. */
export interface DoodlePropContext {
  gen: DoodleGenerator;
  /** Returns Rough.js options with a fresh, repeatable seed. */
  options: (extra?: Record<string, unknown>) => Record<string, unknown>;
  label?: string;
}

/** A prop draws itself around (0, 0); the renderer places it. */
export type DoodlePropDraw = (context: DoodlePropContext) => {
  drawables: DoodleDrawable[];
  labels?: DoodleLabel[];
};

/** The poses and props a doodle can use. */
export interface DoodleRegistry {
  poses: Readonly<Record<string, DoodlePose>>;
  props: Readonly<Record<string, DoodlePropDraw>>;
}
