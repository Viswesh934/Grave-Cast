/**
 * Scribble geometry: turning points into SVG paths, the hand-drawn look,
 * hit testing for the eraser, and reading saved drawings safely.
 * @module components/effects/Scribble/geometry
 */

import { scribbleStroke } from './tokens';

/**
 * What the pointer does.
 *
 * - `pen`: freehand lines
 * - `highlighter`: wide, see-through freehand lines
 * - `line`, `arrow`, `rectangle`, `ellipse`: drag from one corner to the other
 * - `text`: click to type a note
 * - `laser`: point at things with a glowing trail that fades away; nothing is kept
 * - `eraser`: drag over shapes to remove them
 */
export type ScribbleTool = 'pen' | 'highlighter' | 'line' | 'arrow' | 'rectangle' | 'ellipse' | 'text' | 'laser' | 'eraser';

/** The tools that leave a shape behind (everything but the laser and the eraser). */
export type ScribbleShapeKind = Exclude<ScribbleTool, 'laser' | 'eraser'>;

/** Every tool, in toolbar order. */
export const SCRIBBLE_TOOLS: readonly ScribbleTool[] = ['pen', 'highlighter', 'line', 'arrow', 'rectangle', 'ellipse', 'text', 'laser', 'eraser'];

/** The kinds of shape that can be drawn and saved. */
export const SCRIBBLE_SHAPE_KINDS: readonly ScribbleShapeKind[] = ['pen', 'highlighter', 'line', 'arrow', 'rectangle', 'ellipse', 'text'];

/** A point, in px from the top left of the drawing area. */
export interface ScribblePoint {
  x: number;
  y: number;
}

/** One thing drawn. */
export interface ScribbleShape {
  /** Stable id. */
  id: string;
  kind: ScribbleShapeKind;
  color: string;
  /** Line width, in px. */
  width: number;
  /** Drawn with a hand-drawn wobble. */
  sketchy: boolean;
  /**
   * The points: every point for `pen` and `highlighter`, the start and end
   * for `line`, `arrow`, `rectangle`, and `ellipse`, and the top left for `text`.
   */
  points: ScribblePoint[];
  /** The words, for `text`. */
  text?: string;
  /** Keeps the wobble the same every time the shape is drawn. */
  seed: number;
}

/** Turns a seed into a repeatable stream of numbers from 0 to 1 (the mulberry32 generator). */
export const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Paths keep one decimal place, which is sharper than any screen. */
const PATH_PRECISION = 10;
const round = (value: number) => Math.round(value * PATH_PRECISION) / PATH_PRECISION;
const pt = (point: ScribblePoint) => `${round(point.x)} ${round(point.y)}`;

/**
 * A smooth path through freehand points: each point becomes a curve
 * control, and the line passes through the midpoints between them.
 */
export const smoothPath = (points: readonly ScribblePoint[]): string => {
  if (points.length === 0) return '';
  // A single tap still leaves a dot.
  if (points.length === 1) return `M ${pt(points[0])} l 0.01 0`;
  if (points.length === 2) return `M ${pt(points[0])} L ${pt(points[1])}`;
  let d = `M ${pt(points[0])}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const mid = { x: (points[index].x + points[index + 1].x) / 2, y: (points[index].y + points[index + 1].y) / 2 };
    d += ` Q ${pt(points[index])} ${pt(mid)}`;
  }
  return `${d} L ${pt(points[points.length - 1])}`;
};

/** How far a sketchy line may wander, in px. */
const wobbleOf = (shape: ScribbleShape) => Math.max(scribbleStroke.sketchMin, shape.width * scribbleStroke.sketchScale);

/** A straight line, or two slightly different hand-drawn passes over it. */
const linePath = (from: ScribblePoint, to: ScribblePoint, shape: ScribbleShape, random: () => number): string => {
  if (!shape.sketchy) return `M ${pt(from)} L ${pt(to)}`;
  const wobble = wobbleOf(shape);
  const jitter = () => (random() - 0.5) * wobble * 2;
  const pass = () => {
    const bend = { x: (from.x + to.x) / 2 + jitter(), y: (from.y + to.y) / 2 + jitter() };
    return `M ${round(from.x + jitter())} ${round(from.y + jitter())} Q ${pt(bend)} ${round(to.x + jitter())} ${round(to.y + jitter())}`;
  };
  return `${pass()} ${pass()}`;
};

const DEGREES_TO_RADIANS = Math.PI / 180;

const arrowHeadPath = (from: ScribblePoint, to: ScribblePoint, shape: ScribbleShape, random: () => number): string => {
  const length = Math.max(scribbleStroke.arrowMin, shape.width * scribbleStroke.arrowScale);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const spread = scribbleStroke.arrowSpread * DEGREES_TO_RADIANS;
  const wing = (side: 1 | -1) => ({
    x: to.x - length * Math.cos(angle + side * spread),
    y: to.y - length * Math.sin(angle + side * spread),
  });
  return `${linePath(wing(1), to, shape, random)} ${linePath(wing(-1), to, shape, random)}`;
};

/** How far past a full turn each hand-drawn loop goes, the way a hand overshoots when closing one. */
const LOOP_OVERSHOOT = [0.08, 0.04] as const;

const ellipsePath = (from: ScribblePoint, to: ScribblePoint, shape: ScribbleShape, random: () => number): string => {
  const center = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const rx = Math.abs(to.x - from.x) / 2;
  const ry = Math.abs(to.y - from.y) / 2;
  if (!shape.sketchy) {
    return `M ${round(center.x - rx)} ${round(center.y)} a ${round(rx)} ${round(ry)} 0 1 0 ${round(rx * 2)} 0 a ${round(rx)} ${round(ry)} 0 1 0 ${round(-rx * 2)} 0`;
  }
  const wobble = wobbleOf(shape);
  const segments = scribbleStroke.ellipseSegments;
  const pass = (overshoot: number) => {
    const start = random() * Math.PI * 2;
    const ring: ScribblePoint[] = [];
    for (let index = 0; index <= segments * (1 + overshoot); index += 1) {
      const t = start + (index / segments) * Math.PI * 2;
      const wander = (random() - 0.5) * wobble;
      ring.push({ x: center.x + (rx + wander) * Math.cos(t), y: center.y + (ry + wander) * Math.sin(t) });
    }
    return smoothPath(ring);
  };
  return LOOP_OVERSHOOT.map(pass).join(' ');
};

/**
 * The SVG path for a shape. Sketchy shapes are drawn as two slightly
 * different passes, like a quick pen sketch, and look the same every time.
 * Text has no path; it is drawn as text.
 */
export const shapePath = (shape: ScribbleShape): string => {
  const random = seededRandom(shape.seed);
  const [from, to = from] = shape.points;
  if (!from) return '';
  switch (shape.kind) {
    case 'pen':
    case 'highlighter':
      return smoothPath(shape.points);
    case 'line':
      return linePath(from, to, shape, random);
    case 'arrow':
      return `${linePath(from, to, shape, random)} ${arrowHeadPath(from, to, shape, random)}`;
    case 'rectangle': {
      const corners = [from, { x: to.x, y: from.y }, to, { x: from.x, y: to.y }];
      return corners.map((corner, index) => linePath(corner, corners[(index + 1) % corners.length], shape, random)).join(' ');
    }
    case 'ellipse':
      return ellipsePath(from, to, shape, random);
    case 'text':
      return '';
  }
};

/** Line width a shape is drawn with: highlighters are wider. */
export const strokeWidthOf = (shape: ScribbleShape): number =>
  shape.kind === 'highlighter' ? shape.width * scribbleStroke.highlighterScale : shape.width;

/** Font size of a text shape, in px. */
export const textSizeOf = (shape: Pick<ScribbleShape, 'width'>): number =>
  Math.max(scribbleStroke.textMin, shape.width * scribbleStroke.textScale);

/** Roughly how wide a character of text is, as a share of the font size. */
const CHARACTER_WIDTH = 0.6;
/** Line height of text, as a multiple of the font size. */
export const TEXT_LINE_HEIGHT = 1.25;

const distanceToSegment = (point: ScribblePoint, a: ScribblePoint, b: ScribblePoint): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
};

const distanceToPolyline = (point: ScribblePoint, points: readonly ScribblePoint[], closed = false): number => {
  if (points.length === 1) return Math.hypot(point.x - points[0].x, point.y - points[0].y);
  let best = Infinity;
  const last = closed ? points.length : points.length - 1;
  for (let index = 0; index < last; index += 1) {
    best = Math.min(best, distanceToSegment(point, points[index], points[(index + 1) % points.length]));
  }
  return best;
};

/** How far a point is from the nearest edge of a shape, in px. */
export const distanceToShape = (shape: ScribbleShape, point: ScribblePoint): number => {
  const [from, to = from] = shape.points;
  if (!from) return Infinity;
  switch (shape.kind) {
    case 'pen':
    case 'highlighter':
      return distanceToPolyline(point, shape.points);
    case 'line':
    case 'arrow':
      return distanceToSegment(point, from, to);
    case 'rectangle':
      return distanceToPolyline(point, [from, { x: to.x, y: from.y }, to, { x: from.x, y: to.y }], true);
    case 'ellipse': {
      const center = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
      const rx = Math.abs(to.x - from.x) / 2;
      const ry = Math.abs(to.y - from.y) / 2;
      const ring = Array.from({ length: scribbleStroke.ellipseSegments }, (_, index) => {
        const t = (index / scribbleStroke.ellipseSegments) * Math.PI * 2;
        return { x: center.x + rx * Math.cos(t), y: center.y + ry * Math.sin(t) };
      });
      return distanceToPolyline(point, ring, true);
    }
    case 'text': {
      const size = textSizeOf(shape);
      const lines = (shape.text ?? '').split('\n');
      const width = Math.max(...lines.map((line) => line.length)) * size * CHARACTER_WIDTH;
      const height = lines.length * size * TEXT_LINE_HEIGHT;
      const dx = Math.max(from.x - point.x, 0, point.x - (from.x + width));
      const dy = Math.max(from.y - point.y, 0, point.y - (from.y + height));
      return Math.hypot(dx, dy);
    }
  }
};

/** Whether the eraser at `point` touches the shape. */
export const eraserHits = (shape: ScribbleShape, point: ScribblePoint): boolean =>
  distanceToShape(shape, point) <= strokeWidthOf(shape) / 2 + scribbleStroke.eraserReach;

/** Adds a point to a freehand stroke, skipping ones too close to the last. */
export const extendStroke = (points: readonly ScribblePoint[], point: ScribblePoint): ScribblePoint[] => {
  const last = points[points.length - 1];
  if (last && Math.hypot(point.x - last.x, point.y - last.y) < scribbleStroke.minPointGap) return points as ScribblePoint[];
  return [...points, point];
};

/** Whether a shape is big enough to keep (a click without a drag draws nothing). */
export const isWorthKeeping = (shape: ScribbleShape): boolean => {
  if (shape.kind === 'text') return (shape.text ?? '').trim() !== '';
  if (shape.kind === 'pen' || shape.kind === 'highlighter') return shape.points.length > 0;
  const [from, to] = shape.points;
  return Boolean(from && to) && Math.hypot(to.x - from.x, to.y - from.y) >= scribbleStroke.minPointGap * 2;
};

/** Longest text kept in one note, in characters. */
export const SCRIBBLE_TEXT_LIMIT = 500;
/** Longest saved color string accepted. */
const COLOR_LIMIT = 64;
/** Widest line accepted from a saved drawing, in px. */
const WIDTH_LIMIT = 64;
/** Most points accepted in one saved shape. */
const POINT_LIMIT = 10_000;

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/**
 * Checks a saved drawing (from storage, a file, or another app) and returns
 * the shapes that are valid. Anything else is dropped, never trusted.
 */
export const readScribbleShapes = (data: unknown): ScribbleShape[] => {
  if (!Array.isArray(data)) return [];
  const kinds: readonly string[] = SCRIBBLE_SHAPE_KINDS;
  const shapes: ScribbleShape[] = [];
  for (const item of data.slice(-scribbleStroke.maxShapes)) {
    if (typeof item !== 'object' || item === null) continue;
    const shape = item as Record<string, unknown>;
    if (typeof shape.id !== 'string' || !kinds.includes(shape.kind as string)) continue;
    if (typeof shape.color !== 'string' || shape.color.length > COLOR_LIMIT) continue;
    if (!isNumber(shape.width) || shape.width <= 0 || shape.width > WIDTH_LIMIT || !isNumber(shape.seed)) continue;
    if (!Array.isArray(shape.points) || shape.points.length === 0 || shape.points.length > POINT_LIMIT) continue;
    const points = (shape.points as unknown[]).filter(
      (p): p is ScribblePoint => typeof p === 'object' && p !== null && isNumber((p as ScribblePoint).x) && isNumber((p as ScribblePoint).y)
    );
    if (points.length !== shape.points.length) continue;
    const text = typeof shape.text === 'string' ? shape.text.slice(0, SCRIBBLE_TEXT_LIMIT) : undefined;
    shapes.push({
      id: shape.id,
      kind: shape.kind as ScribbleShapeKind,
      color: shape.color,
      width: shape.width,
      sketchy: shape.sketchy === true,
      points: points.map(({ x, y }) => ({ x, y })),
      text,
      seed: shape.seed >>> 0,
    });
  }
  return shapes;
};

/** Seeds for the hand-drawn wobble. */
const SEED_RANGE = 2 ** 31;

/** A fresh id and wobble seed for a new shape. */
export const newShapeIdentity = (): { id: string; seed: number } => {
  const seed = Math.floor(Math.random() * SEED_RANGE);
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `shape-${Date.now()}-${seed}`;
  return { id, seed };
};
