/**
 * The prop library. Each prop draws itself around (0, 0) in local units; the
 * renderer moves, scales, and turns it into place. Batches add props here as
 * their doodle scripts need them.
 * @module components/effects/Doodle/props
 */
import { ICON_SHAPES } from './propsIcons';
import { ITEM_SHAPES } from './propsItems';
import { SCENE_SHAPES } from './propsScenes';
import { shapeProp } from './shapes';
import { doodleInk, doodleText } from './tokens';
import type { DoodleDrawable, DoodleLabel, DoodlePropContext, DoodlePropDraw } from './types';

/** Length of an arrowhead's wings, in local units. */
const HEAD = 4;

/** An arrowhead at `to`, pointing away from `from`. */
const arrowHead = (
  { gen, options }: DoodlePropContext,
  from: [number, number],
  to: [number, number]
): DoodleDrawable[] => {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const wing = (side: 1 | -1): [number, number] => [
    to[0] - HEAD * Math.cos(angle + (side * Math.PI) / 6),
    to[1] - HEAD * Math.sin(angle + (side * Math.PI) / 6),
  ];
  return [gen.linearPath([wing(1), to, wing(-1)], options())];
};

/** A line with a head at `to`, and optionally at `from` too. */
const arrow = (context: DoodlePropContext, from: [number, number], to: [number, number], both = false): DoodleDrawable[] => [
  context.gen.line(from[0], from[1], to[0], to[1], context.options()),
  ...arrowHead(context, from, to),
  ...(both ? arrowHead(context, to, from) : []),
];

/** Width of a badge that fits `text`, plus room for an icon. */
const badgeWidth = (text: string, icon = 0) =>
  text.length * doodleText.size * doodleText.charWidth + doodleText.badgePadding * 2 + icon;

/** A rounded-off box with a label, centred on (0, 0). Room for a small icon on the left. */
const badge = (context: DoodlePropContext, text: string, icon = 0): { drawables: DoodleDrawable[]; labels: DoodleLabel[] } => {
  const width = badgeWidth(text, icon);
  const height = doodleText.badgeHeight;
  return {
    drawables: [context.gen.rectangle(-width / 2, -height / 2, width, height, context.options())],
    labels: [{ x: icon / 2, y: doodleText.size / 3, text, anchor: 'middle' }],
  };
};

/** A badge with a small clock face on the left. A placement's `label` replaces the time, for ranges such as "15\u201320 min". */
const timerBadge = (fallback: string): DoodlePropDraw => (context) => {
  const text = context.label ?? fallback;
  const iconRoom = doodleText.badgeHeight;
  const base = badge(context, text, iconRoom);
  const clockX = -badgeWidth(text, iconRoom) / 2 + iconRoom / 2 + 1;
  const size = doodleText.badgeHeight - 5;
  return {
    drawables: [
      ...base.drawables,
      context.gen.circle(clockX, 0, size, context.options()),
      context.gen.linearPath([[clockX, -size / 3], [clockX, 0], [clockX + size / 3, 0]], context.options()),
    ],
    labels: base.labels,
  };
};

/** A plain badge with fixed text. A placement's `label` replaces it. */
const textBadge = (text: string): DoodlePropDraw => (context) => badge(context, context.label ?? text);

/** Every prop drawn from shapes: the icons, the objects, and the close-ups and scenes. */
const SHAPE_PROPS: Readonly<Record<string, DoodlePropDraw>> = Object.freeze(
  Object.fromEntries(Object.entries({ ...ICON_SHAPES, ...ITEM_SHAPES, ...SCENE_SHAPES }).map(([id, shapes]) => [id, shapeProp(shapes)]))
);

/** Every built-in prop, by id. Ids match the doodle scripts in docs/KIT_SCRIPTS.md. */
export const DOODLE_PROPS: Readonly<Record<string, DoodlePropDraw>> = Object.freeze({
  /** A badge showing its placement's `label`. */
  badge: (context) => badge(context, context.label ?? ''),

  /** A straight arrow pointing right. Turn it with `rotate`. */
  arrow: (context) => ({ drawables: arrow(context, [-10, 0], [10, 0]) }),

  /** A short arrow pointing down, for pushing. */
  push_arrow: (context) => ({ drawables: arrow(context, [0, -8], [0, 8]) }),

  /** A small ring marking a point on the body. */
  hand_marker: (context) => ({ drawables: [context.gen.circle(0, 0, 6, context.options())] }),

  /** A tick, for a Do. */
  tick: (context) => ({ drawables: [context.gen.linearPath([[-6, 0], [-2, 5], [7, -6]], context.options())] }),

  /** A cross, for a Don't. */
  cross: (context) => ({
    drawables: [context.gen.line(-5, -5, 5, 5, context.options()), context.gen.line(5, -5, -5, 5, context.options())],
  }),

  /** A phone with call waves, for calling the local emergency number. */
  phone_sos: (context) => ({
    drawables: [
      context.gen.rectangle(-5, -8, 10, 16, context.options()),
      context.gen.line(-2, 5, 2, 5, context.options()),
      context.gen.arc(5, -2, 10, 10, -Math.PI / 4, Math.PI / 4, false, context.options()),
      context.gen.arc(5, -2, 18, 18, -Math.PI / 4, Math.PI / 4, false, context.options()),
    ],
  }),

  /** A two-headed arrow showing how deep to push, labelled 5 cm. */
  depth_arrow_5cm: (context) => ({
    drawables: arrow(context, [0, -8], [0, 8], true),
    labels: [{ x: 4, y: 3, text: '5 cm', anchor: 'start' }],
  }),

  /** A two-headed arrow showing how deep to push, labelled 4 cm. */
  depth_arrow_4cm: (context) => ({
    drawables: arrow(context, [0, -7], [0, 7], true),
    labels: [{ x: 4, y: 3, text: '4 cm', anchor: 'start' }],
  }),

  timer_10s: timerBadge('10 s'),
  rate_badge: textBadge('100–120 / min'),
  loop_30_2_badge: textBadge('30 : 2'),

  /** A headstone with a carved cross, standing on the ground at y = 0. */
  tombstone: (context) => ({
    drawables: [
      context.gen.path('M -12 0 L -12 -24 Q -12 -36 0 -36 Q 12 -36 12 -24 L 12 0 Z', context.options()),
      context.gen.line(0, -29, 0, -13, context.options()),
      context.gen.line(-6, -23, 6, -23, context.options()),
    ],
  }),

  /** A crescent moon: a solid disc with a bite taken out in the background color. */
  moon: (context) => ({
    drawables: [
      context.gen.circle(0, 0, 16, context.options({ stroke: 'none', fill: doodleInk.line, fillStyle: 'solid' })),
      context.gen.circle(5, -3, 14, context.options({ stroke: 'none', fill: doodleInk.halo, fillStyle: 'solid' })),
    ],
  }),

  // Timers and badges, as the scripts name them.
  timer_1_3m_badge: timerBadge('at least 1 min'),
  timer_5m_badge: timerBadge('5 min'),
  timer_5_15m_badge: timerBadge('5\u201315 min'),
  timer_20m_badge: timerBadge('20 min'),
  timer_30m_badge: timerBadge('30 min'),
  badge_5_breaths: textBadge('5 breaths'),
  stop_shake_badge: textBadge('until it stops'),
  // Icons, objects, close-ups and scenes, drawn from shapes (see shapes.ts).
  ...SHAPE_PROPS,
});
