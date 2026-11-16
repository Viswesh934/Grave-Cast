/**
 * A small drawing language for doodle props. A prop is a list of shapes in
 * local units, centred on (0, 0); `shapeProp` turns the list into a prop the
 * renderer can draw. Shapes are data, so a new prop is a few lines, not a new
 * function, and every prop shares the same ink, stroke and hand-drawn look.
 *
 * Coordinates are drawing data, in the same local units as the figures: an
 * adult is 100 units tall, and a typical icon is about 24 units across.
 * @module components/effects/Doodle/shapes
 */
import { doodleInk, doodleStroke, doodleText } from './tokens';
import type { DoodleDrawable, DoodleLabel, DoodlePropDraw } from './types';

/** A point: x then y, in local units. */
export type Pt = readonly [number, number];

/** How a shape is drawn. Plain outline in the doodle ink unless set. */
export interface ShapeStyle {
  /** `ink` fills with the figure ink; `knockout` fills with the surface, hiding what is behind. */
  fill?: 'ink' | 'knockout';
  /** Stroke width, in local units. Defaults to the prop width. */
  width?: number;
  /** Draw in the one muted accent, to point at the key detail or cross out a thing. */
  accent?: boolean;
  /** A dashed line, for something faint, hidden, or not there yet. */
  dash?: boolean;
}

/** One shape of a prop. Build them with `L`, `R`, `C`, `E`, `P`, `G`, `Q`, `A`, `D`, `T`, and `AR`. */
export type Shape =
  | { kind: 'line'; a: Pt; b: Pt; style?: ShapeStyle }
  | { kind: 'rect'; at: Pt; size: Pt; style?: ShapeStyle }
  | { kind: 'circle'; at: Pt; d: number; style?: ShapeStyle }
  | { kind: 'ellipse'; at: Pt; size: Pt; style?: ShapeStyle }
  | { kind: 'poly'; pts: readonly Pt[]; closed: boolean; style?: ShapeStyle }
  | { kind: 'curve'; pts: readonly Pt[]; style?: ShapeStyle }
  | { kind: 'arc'; at: Pt; size: Pt; from: number; to: number; style?: ShapeStyle }
  | { kind: 'path'; d: string; style?: ShapeStyle }
  | { kind: 'text'; at: Pt; text: string; size?: number; anchor?: 'start' | 'middle' | 'end'; editable?: boolean };

/** Something `S` can flatten: a shape, a list of shapes, or nothing. */
export type ShapePart = Shape | readonly Shape[] | false | null | undefined;

/** A line from (x1, y1) to (x2, y2). */
export const L = (x1: number, y1: number, x2: number, y2: number, style?: ShapeStyle): Shape => ({ kind: 'line', a: [x1, y1], b: [x2, y2], style });
/** A rectangle with its top-left corner at (x, y). */
export const R = (x: number, y: number, w: number, h: number, style?: ShapeStyle): Shape => ({ kind: 'rect', at: [x, y], size: [w, h], style });
/** A circle centred at (x, y), `d` across. */
export const C = (x: number, y: number, d: number, style?: ShapeStyle): Shape => ({ kind: 'circle', at: [x, y], d, style });
/** An ellipse centred at (x, y), `w` wide and `h` tall. */
export const E = (x: number, y: number, w: number, h: number, style?: ShapeStyle): Shape => ({ kind: 'ellipse', at: [x, y], size: [w, h], style });
/** An open line through the points. */
export const P = (pts: readonly Pt[], style?: ShapeStyle): Shape => ({ kind: 'poly', pts, closed: false, style });
/** A closed shape through the points. */
export const G = (pts: readonly Pt[], style?: ShapeStyle): Shape => ({ kind: 'poly', pts, closed: true, style });
/** A smooth curve through the points. */
export const Q = (pts: readonly Pt[], style?: ShapeStyle): Shape => ({ kind: 'curve', pts, style });
/** Part of an ellipse centred at (x, y), `w` by `h`, from one angle to another, in degrees (0 right, 90 down). */
export const A = (x: number, y: number, w: number, h: number, from: number, to: number, style?: ShapeStyle): Shape => ({
  kind: 'arc',
  at: [x, y],
  size: [w, h],
  from,
  to,
  style,
});
/** An SVG path. Absolute M, L, Q, C and Z only, so it can be moved and scaled. */
export const D = (d: string, style?: ShapeStyle): Shape => ({ kind: 'path', d, style });
/** Text. With `editable`, the placement's `label` replaces it. */
export const T = (x: number, y: number, text: string, size?: number, anchor: 'start' | 'middle' | 'end' = 'middle', editable = false): Shape => ({
  kind: 'text',
  at: [x, y],
  text,
  size,
  anchor,
  editable,
});

/** Length of an arrowhead's wings. */
const HEAD = 4;
/** An arrow from (x1, y1) to (x2, y2), with a head at the end, and at the start too when `both`. */
export const AR = (x1: number, y1: number, x2: number, y2: number, both = false, style?: ShapeStyle): Shape[] => {
  const wings = (fx: number, fy: number, tx: number, ty: number): Shape => {
    const angle = Math.atan2(ty - fy, tx - fx);
    const wing = (side: number): Pt => [tx - HEAD * Math.cos(angle + (side * Math.PI) / 6), ty - HEAD * Math.sin(angle + (side * Math.PI) / 6)];
    return P([wing(1), [tx, ty], wing(-1)], style);
  };
  return [L(x1, y1, x2, y2, style), wings(x1, y1, x2, y2), ...(both ? [wings(x2, y2, x1, y1)] : [])];
};

/** Joins shapes, lists of shapes, and gaps (`false`, `null`) into one list. */
export const S = (...parts: ShapePart[]): Shape[] => parts.flatMap((part) => (part ? (Array.isArray(part) ? part : [part as Shape]) : []));

const movePt = ([x, y]: Pt, dx: number, dy: number, k: number): Pt => [x * k + dx, y * k + dy];

/** Scales a path's absolute coordinates, then moves them. */
const movePath = (d: string, dx: number, dy: number, k: number): string => {
  let axis = 0;
  return d.replace(/[MLQCZ]|-?\d*\.?\d+/g, (token) => {
    if (/[MLQCZ]/.test(token)) {
      axis = 0;
      return token;
    }
    const value = Number(token) * k + (axis % 2 === 0 ? dx : dy);
    axis += 1;
    return String(Math.round(value * 100) / 100);
  });
};

/** Scales shapes by `k` about (0, 0), then moves them by (dx, dy). Line widths keep their size. */
export const move = (shapes: readonly Shape[], dx: number, dy: number, k = 1): Shape[] =>
  shapes.map((shape): Shape => {
    switch (shape.kind) {
      case 'line':
        return { ...shape, a: movePt(shape.a, dx, dy, k), b: movePt(shape.b, dx, dy, k) };
      case 'rect':
        return { ...shape, at: movePt(shape.at, dx, dy, k), size: [shape.size[0] * k, shape.size[1] * k] };
      case 'circle':
        return { ...shape, at: movePt(shape.at, dx, dy, k), d: shape.d * k };
      case 'ellipse':
      case 'arc':
        return { ...shape, at: movePt(shape.at, dx, dy, k), size: [shape.size[0] * k, shape.size[1] * k] };
      case 'poly':
      case 'curve':
        return { ...shape, pts: shape.pts.map((pt) => movePt(pt, dx, dy, k)) };
      case 'path':
        return { ...shape, d: movePath(shape.d, dx, dy, k) };
      case 'text':
        return { ...shape, at: movePt(shape.at, dx, dy, k), size: shape.size === undefined ? undefined : shape.size * k };
    }
  });

/** The box a list of shapes covers, for checking that a prop fits where it is placed. */
export const shapeBounds = (shapes: readonly Shape[]): { minX: number; minY: number; maxX: number; maxY: number } => {
  const xs: number[] = [];
  const ys: number[] = [];
  const add = (x: number, y: number) => {
    xs.push(x);
    ys.push(y);
  };
  for (const shape of shapes) {
    switch (shape.kind) {
      case 'line':
        add(...shape.a);
        add(...shape.b);
        break;
      case 'rect':
        add(shape.at[0], shape.at[1]);
        add(shape.at[0] + shape.size[0], shape.at[1] + shape.size[1]);
        break;
      case 'circle':
        add(shape.at[0] - shape.d / 2, shape.at[1] - shape.d / 2);
        add(shape.at[0] + shape.d / 2, shape.at[1] + shape.d / 2);
        break;
      case 'ellipse':
      case 'arc':
        add(shape.at[0] - shape.size[0] / 2, shape.at[1] - shape.size[1] / 2);
        add(shape.at[0] + shape.size[0] / 2, shape.at[1] + shape.size[1] / 2);
        break;
      case 'poly':
      case 'curve':
        shape.pts.forEach((pt) => add(...pt));
        break;
      case 'path': {
        const numbers = (shape.d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
        for (let index = 0; index + 1 < numbers.length; index += 2) add(numbers[index], numbers[index + 1]);
        break;
      }
      case 'text': {
        const size = shape.size ?? doodleText.size;
        const half = (shape.text.length * size * doodleText.charWidth) / 2;
        const left = shape.anchor === 'start' ? 0 : shape.anchor === 'end' ? -half * 2 : -half;
        add(shape.at[0] + left, shape.at[1] - size);
        add(shape.at[0] + left + half * 2, shape.at[1]);
        break;
      }
    }
  }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
};

const DEGREES = Math.PI / 180;
/** Length of one dash and one gap, for dashed shapes. */
const DASH: [number, number] = [3, 3];

/** Turns a list of shapes into a prop the renderer can draw. */
export const shapeProp =
  (shapes: readonly Shape[]): DoodlePropDraw =>
  (context) => {
    const drawables: DoodleDrawable[] = [];
    const labels: DoodleLabel[] = [];
    const look = (style: ShapeStyle | undefined) => {
      const extra: Record<string, unknown> = {};
      if (style?.fill === 'ink') Object.assign(extra, { stroke: 'none', fill: doodleInk.line, fillStyle: 'solid' });
      if (style?.fill === 'knockout') Object.assign(extra, { stroke: 'none', fill: doodleInk.halo, fillStyle: 'solid' });
      if (style?.accent) Object.assign(extra, { stroke: doodleInk.accent, strokeWidth: doodleStroke.accent });
      if (style?.width !== undefined) extra.strokeWidth = style.width;
      if (style?.dash) extra.strokeLineDash = DASH;
      return context.options(extra);
    };
    const { gen } = context;
    const points = (pts: readonly Pt[]) => pts.map((pt) => [...pt] as [number, number]);
    for (const shape of shapes) {
      switch (shape.kind) {
        case 'line':
          drawables.push(gen.line(shape.a[0], shape.a[1], shape.b[0], shape.b[1], look(shape.style)));
          break;
        case 'rect':
          drawables.push(gen.rectangle(shape.at[0], shape.at[1], shape.size[0], shape.size[1], look(shape.style)));
          break;
        case 'circle':
          drawables.push(gen.circle(shape.at[0], shape.at[1], shape.d, look(shape.style)));
          break;
        case 'ellipse':
          drawables.push(gen.ellipse(shape.at[0], shape.at[1], shape.size[0], shape.size[1], look(shape.style)));
          break;
        case 'poly':
          drawables.push(shape.closed ? gen.polygon(points(shape.pts), look(shape.style)) : gen.linearPath(points(shape.pts), look(shape.style)));
          break;
        case 'curve':
          drawables.push(gen.curve(points(shape.pts), look(shape.style)));
          break;
        case 'arc':
          drawables.push(gen.arc(shape.at[0], shape.at[1], shape.size[0], shape.size[1], shape.from * DEGREES, shape.to * DEGREES, false, look(shape.style)));
          break;
        case 'path':
          drawables.push(gen.path(shape.d, look(shape.style)));
          break;
        case 'text':
          labels.push({
            x: shape.at[0],
            y: shape.at[1],
            text: shape.editable && context.label ? context.label : shape.text,
            size: shape.size,
            anchor: shape.anchor,
          });
          break;
      }
    }
    return { drawables, labels };
  };

/** A limb outline: a capsule from (x1, y1) to (x2, y2), `r` wide on each side. Used for close-ups of arms and legs. */
export const limb = (x1: number, y1: number, x2: number, y2: number, r: number, style?: ShapeStyle): Shape[] => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const nx = -Math.sin(angle) * r;
  const ny = Math.cos(angle) * r;
  const deg = angle / DEGREES;
  return [
    L(x1 + nx, y1 + ny, x2 + nx, y2 + ny, style),
    L(x1 - nx, y1 - ny, x2 - nx, y2 - ny, style),
    A(x2, y2, r * 2, r * 2, deg - 90, deg + 90, style),
    A(x1, y1, r * 2, r * 2, deg + 90, deg + 270, style),
  ];
};

/** Rays around a centre, as short lines: a sun, a spark, a shine. */
export const rays = (count: number, from: number, to: number, style?: ShapeStyle): Shape[] =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return L(Math.cos(angle) * from, Math.sin(angle) * from, Math.cos(angle) * to, Math.sin(angle) * to, style);
  });

/** A "do not" sign: a ring with a slash through whatever is inside it, and a short label under it. */
export const noSign = (inner: readonly Shape[], label?: string): Shape[] =>
  S(
    C(0, 0, 24),
    move(inner, 0, 0, 0.8),
    L(-8.5, -8.5, 8.5, 8.5, { accent: true, width: 2.4 }),
    label ? T(0, 21, label, 7.5, 'middle', true) : false
  );
