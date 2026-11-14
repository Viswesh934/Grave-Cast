/**
 * Turns doodle data into SVG path data with Rough.js. Pure: no DOM, the same
 * output for the same input, so a doodle looks identical on every device.
 *
 * Figures are drawn as silhouettes, like instructional pictograms: a rounded
 * capsule torso, thick rounded limbs, and a solid head set slightly apart from
 * the shoulders. A thin outline in the background color separates figures that
 * overlap.
 * @module components/effects/Doodle/render
 */
import rough from 'roughjs';
import { DOODLE_POSES } from './poses';
import { DOODLE_PROPS } from './props';
import { doodleCanvas, doodleFigure, doodleHighlight, doodleInk, doodleStroke, doodleText } from './tokens';
import type {
  DoodleDrawable,
  DoodleFigure,
  DoodleJoint,
  DoodlePoint,
  DoodlePose,
  DoodleRegistry,
  DoodleSpec,
} from './types';

/** The built-in poses and props. */
export const doodleRegistry: DoodleRegistry = Object.freeze({ poses: DOODLE_POSES, props: DOODLE_PROPS });

/** A registry with extra poses and props added on top of another (the built-ins by default). */
export const extendDoodleRegistry = (extra: Partial<DoodleRegistry>, base: DoodleRegistry = doodleRegistry): DoodleRegistry =>
  Object.freeze({
    poses: Object.freeze({ ...base.poses, ...extra.poses }),
    props: Object.freeze({ ...base.props, ...extra.props }),
  });

/** One stroke or shape, ready for an SVG `<path>`. */
export interface DoodlePathMark {
  kind: 'path';
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  opacity?: number;
  /** The separating outline behind a figure. Shown at once, never animated. */
  halo?: boolean;
}

/** A line of text, ready for an SVG `<text>`. */
export interface DoodleTextMark {
  kind: 'text';
  x: number;
  y: number;
  text: string;
  size: number;
  anchor: 'start' | 'middle' | 'end';
  color: string;
}

export type DoodleMark = DoodlePathMark | DoodleTextMark;

/** A set of marks drawn together: one figure, one prop, the ground, or the highlight. */
export interface DoodleGroup {
  key: string;
  transform?: string;
  motion?: 'push';
  /** Props are scaled, but their lines keep their width. */
  keepStrokeWidth?: boolean;
  marks: DoodleMark[];
}

/** A doodle, drawn. */
export interface RenderedDoodle {
  width: number;
  height: number;
  groups: DoodleGroup[];
}

/** Rough.js treats a seed of 0 as "random", so seeds stay in 1 to this. */
const SEED_LIMIT = 2147483646;
/** Spreads the per-stroke seeds apart. */
const SEED_STEP = 7919;

/** A repeatable seed from a doodle id (32-bit FNV-1a). */
export const doodleSeed = (id: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return (hash % SEED_LIMIT) + 1;
};

/** A figure's joints in doodle coordinates, after size, facing, and position are applied. */
export interface PlacedFigure {
  joints: Record<DoodleJoint, DoodlePoint>;
  headRadius: number;
  /** How thick this figure's limbs and torso are, as a share of an adult's. */
  strokeScale: number;
  /** Degrees: 0 right, 90 down, 180 left, 270 up. */
  face?: number;
}

/** Places a pose: scales it to the figure's size, mirrors it if facing right, and moves it into position. */
export const placeFigure = (pose: DoodlePose, figure: DoodleFigure, groundY: number): PlacedFigure => {
  const size = doodleFigure.sizes[figure.size ?? 'adult'];
  const mirror = figure.facing === 'right' ? -1 : 1;
  const originY = figure.y ?? groundY;
  const place = (point: DoodlePoint): DoodlePoint => ({
    x: figure.x + point.x * size.scale * mirror,
    y: originY + point.y * size.scale,
  });
  const joints = {} as Record<DoodleJoint, DoodlePoint>;
  (Object.keys(pose.joints) as DoodleJoint[]).forEach((joint) => {
    joints[joint] = place(pose.joints[joint]);
  });

  const strokeScale = Math.max(size.scale, doodleStroke.minScale);
  const headRadius = doodleFigure.headRadius * size.scale * size.head;
  // The head sits in the pose's direction from the shoulders, just clear of the torso's rounded top.
  const { shoulder, head } = joints;
  const dx = head.x - shoulder.x;
  const dy = head.y - shoulder.y;
  const length = Math.hypot(dx, dy) || 1;
  const reach = (doodleStroke.torso * strokeScale) / 2 + doodleFigure.neckGap * size.scale + headRadius;
  joints.head = { x: shoulder.x + (dx / length) * reach, y: shoulder.y + (dy / length) * reach };

  const face = pose.face === undefined ? undefined : mirror === 1 ? pose.face : 180 - pose.face;
  return { joints, headRadius, strokeScale, face };
};

/** The body parts, back to front: far limbs, then the torso, then near limbs. */
const BODY_PARTS: readonly { joints: readonly DoodleJoint[]; width: 'limb' | 'torso'; far?: boolean }[] = [
  { joints: ['shoulder', 'elbowFar', 'handFar'], width: 'limb', far: true },
  { joints: ['hip', 'kneeFar', 'footFar'], width: 'limb', far: true },
  { joints: ['shoulder', 'hip'], width: 'torso' },
  { joints: ['shoulder', 'elbowNear', 'handNear'], width: 'limb' },
  { joints: ['hip', 'kneeNear', 'footNear'], width: 'limb' },
];

/** Draws a doodle. Unknown poses and props are skipped; `validateDoodle` reports them. */
export const renderDoodle = (spec: DoodleSpec, registry: DoodleRegistry = doodleRegistry): RenderedDoodle => {
  const width = spec.width ?? doodleCanvas.width;
  const height = spec.height ?? doodleCanvas.height;
  const groundY = spec.ground === false ? height : spec.ground ?? height - doodleCanvas.groundInset;
  const gen = rough.generator();
  const baseSeed = spec.seed ?? doodleSeed(spec.id);
  let strokes = 0;
  const options = (extra: Record<string, unknown> = {}) => {
    strokes += 1;
    return {
      seed: ((baseSeed + strokes * SEED_STEP) % SEED_LIMIT) + 1,
      roughness: doodleStroke.roughness,
      bowing: doodleStroke.bowing,
      // One clean stroke per line instead of Rough.js's doubled sketch stroke.
      disableMultiStroke: true,
      disableMultiStrokeFill: true,
      stroke: doodleInk.line,
      strokeWidth: doodleStroke.prop,
      ...extra,
    };
  };
  const toMarks = (drawables: DoodleDrawable[], extra: Partial<DoodlePathMark> = {}): DoodleMark[] =>
    drawables.flatMap((drawable) =>
      gen.toPaths(drawable).map((path) => ({
        kind: 'path' as const,
        d: path.d,
        stroke: path.stroke,
        strokeWidth: path.strokeWidth,
        fill: path.fill ?? 'none',
        ...extra,
      }))
    );

  const groups: DoodleGroup[] = [];

  if (spec.ground !== false) {
    groups.push({
      key: 'ground',
      marks: toMarks([gen.line(0, groundY, width, groundY, options({ stroke: doodleInk.quiet, strokeWidth: doodleStroke.ground }))]),
    });
  }

  const placed = (spec.figures ?? []).map((figure) => {
    const pose = registry.poses[figure.pose];
    return pose ? placeFigure(pose, figure, groundY) : null;
  });

  placed.forEach((figure, index) => {
    if (!figure) return;
    const widthOf = (part: 'limb' | 'torso') => doodleStroke[part] * figure.strokeScale;
    const points = (joints: readonly DoodleJoint[]) =>
      joints.map((joint) => [figure.joints[joint].x, figure.joints[joint].y] as [number, number]);
    const { head } = figure.joints;
    const halo = doodleStroke.halo;

    const haloMarks = [
      ...BODY_PARTS.map((part) =>
        gen.linearPath(points(part.joints), options({ stroke: doodleInk.halo, strokeWidth: widthOf(part.width) + halo * 2 }))
      ),
      gen.circle(head.x, head.y, (figure.headRadius + halo) * 2, options({ stroke: 'none', fill: doodleInk.halo, fillStyle: 'solid' })),
    ];
    const bodyMarks = BODY_PARTS.flatMap((part) =>
      toMarks([gen.linearPath(points(part.joints), options({ strokeWidth: widthOf(part.width) }))], {
        opacity: part.far ? doodleStroke.farOpacity : undefined,
      })
    );
    const headMarks = toMarks([
      gen.circle(head.x, head.y, figure.headRadius * 2, options({ stroke: 'none', fill: doodleInk.line, fillStyle: 'solid' })),
    ]);

    groups.push({
      key: `figure-${index}`,
      motion: spec.figures?.[index].motion,
      marks: [...toMarks(haloMarks, { halo: true }), ...bodyMarks, ...headMarks],
    });
  });

  (spec.props ?? []).forEach((placement, index) => {
    const draw = registry.props[placement.prop];
    if (!draw) return;
    const result = draw({ gen, options, label: placement.label });
    const transforms = [`translate(${placement.x} ${placement.y})`];
    if (placement.rotate) transforms.push(`rotate(${placement.rotate})`);
    if (placement.scale && placement.scale !== 1) transforms.push(`scale(${placement.scale})`);
    groups.push({
      key: `prop-${index}`,
      transform: transforms.join(' '),
      keepStrokeWidth: true,
      marks: [
        ...toMarks(result.drawables),
        ...(result.labels ?? []).map((label) => ({
          kind: 'text' as const,
          x: label.x,
          y: label.y,
          text: label.text,
          size: label.size ?? doodleText.size,
          anchor: label.anchor ?? 'middle',
          color: doodleInk.text,
        })),
      ],
    });
  });

  const highlight = spec.highlight;
  if (highlight) {
    let center: DoodlePoint | null = null;
    let radius: number = doodleHighlight.radius;
    if ('figure' in highlight) {
      const figure = placed[highlight.figure];
      if (figure) {
        center = figure.joints[highlight.joint];
        if (highlight.joint === 'head') radius = figure.headRadius + doodleHighlight.radius / 2;
      }
    } else {
      const placement = spec.props?.[highlight.prop];
      if (placement) {
        center = { x: placement.x, y: placement.y };
        radius = doodleHighlight.radius * 2 * (placement.scale ?? 1);
      }
    }
    if (center) {
      groups.push({
        key: 'highlight',
        marks: toMarks([gen.circle(center.x, center.y, radius * 2, options({ stroke: doodleInk.accent, strokeWidth: doodleStroke.accent }))]),
      });
    }
  }

  return { width, height, groups };
};
