/**
 * Rectangles, box sides, label placement, and following an element as it moves.
 * @module grimoire/dom/geometry
 */

/** A rectangle in viewport pixels, measured from the top-left corner. */
export interface BoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The four sides of a box, in pixels. */
export interface BoxSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A width and a height, in pixels. */
export interface BoxSize {
  width: number;
  height: number;
}

/** A plain copy of a `DOMRect`, safe to keep and compare. */
export const toBoxRect = (rect: { x: number; y: number; width: number; height: number }): BoxRect => ({
  x: rect.x,
  y: rect.y,
  width: rect.width,
  height: rect.height,
});

/** Grows a rectangle outward by each side (shrinks it for negative sides). */
export const expandRect = (rect: BoxRect, sides: BoxSides): BoxRect => ({
  x: rect.x - sides.left,
  y: rect.y - sides.top,
  width: Math.max(0, rect.width + sides.left + sides.right),
  height: Math.max(0, rect.height + sides.top + sides.bottom),
});

/** Shrinks a rectangle inward by each side. */
export const shrinkRect = (rect: BoxRect, sides: BoxSides): BoxRect =>
  expandRect(rect, { top: -sides.top, right: -sides.right, bottom: -sides.bottom, left: -sides.left });

/** `true` when two rectangles are the same, to the pixel fraction. */
export const sameRect = (a: BoxRect | null, b: BoxRect | null): boolean =>
  a === b || (a !== null && b !== null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);

/** Which side of its anchor a label sits on. */
export type PlacementSide = 'top' | 'bottom' | 'left' | 'right';

/**
 * Options for {@link placeNear}.
 */
export interface PlaceNearOptions {
  /** The side to try first. The opposite side is tried next. @default 'top' */
  side?: PlacementSide;
  /** Space between the anchor and the label, in px. @default PLACEMENT_GAP_PX */
  gap?: number;
  /** Space kept clear at the edges of the viewport, in px. @default PLACEMENT_MARGIN_PX */
  margin?: number;
}

/**
 * Where a label goes, from {@link placeNear}.
 */
export interface Placement {
  x: number;
  y: number;
  /** The side it ended up on. */
  side: PlacementSide;
  /** `false` when no side had room and the label was pushed inside the viewport, possibly over the anchor. */
  fits: boolean;
}

/** Default space between an anchor and its label. */
export const PLACEMENT_GAP_PX = 8;

/** Default clear space at the viewport edges. */
export const PLACEMENT_MARGIN_PX = 8;

const OPPOSITE: Record<PlacementSide, PlacementSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const PERPENDICULAR: Record<PlacementSide, [PlacementSide, PlacementSide]> = {
  top: ['right', 'left'],
  bottom: ['right', 'left'],
  left: ['top', 'bottom'],
  right: ['top', 'bottom'],
};

const clamp = (value: number, min: number, max: number): number => (max < min ? min : Math.min(max, Math.max(min, value)));

/**
 * Places a label (tooltip, tag, or panel) beside an anchor so it stays inside
 * the viewport. It tries the preferred side, then the opposite one, then the
 * other two, and slides the label along that side to keep it on screen. If
 * nothing fits, it uses the side with the most room and pushes the label in.
 *
 * Pure: pass in sizes, get a position. Works for anything, not just Grimoire.
 *
 * @example
 * ```ts
 * const { x, y } = placeNear(target.getBoundingClientRect(), { width: 160, height: 28 }, {
 *   width: innerWidth,
 *   height: innerHeight,
 * });
 * ```
 */
export const placeNear = (anchor: BoxRect, size: BoxSize, viewport: BoxSize, options: PlaceNearOptions = {}): Placement => {
  const { side = 'top', gap = PLACEMENT_GAP_PX, margin = PLACEMENT_MARGIN_PX } = options;
  const minX = margin;
  const minY = margin;
  const maxX = viewport.width - margin - size.width;
  const maxY = viewport.height - margin - size.height;

  const room: Record<PlacementSide, number> = {
    top: anchor.y - gap - margin,
    bottom: viewport.height - (anchor.y + anchor.height) - gap - margin,
    left: anchor.x - gap - margin,
    right: viewport.width - (anchor.x + anchor.width) - gap - margin,
  };
  const needs = (candidate: PlacementSide) => (candidate === 'top' || candidate === 'bottom' ? size.height : size.width);

  const positionOn = (candidate: PlacementSide): { x: number; y: number } => {
    const centerX = anchor.x + anchor.width / 2 - size.width / 2;
    const centerY = anchor.y + anchor.height / 2 - size.height / 2;
    switch (candidate) {
      case 'top':
        return { x: clamp(centerX, minX, maxX), y: anchor.y - gap - size.height };
      case 'bottom':
        return { x: clamp(centerX, minX, maxX), y: anchor.y + anchor.height + gap };
      case 'left':
        return { x: anchor.x - gap - size.width, y: clamp(centerY, minY, maxY) };
      default:
        return { x: anchor.x + anchor.width + gap, y: clamp(centerY, minY, maxY) };
    }
  };

  const order: PlacementSide[] = [side, OPPOSITE[side], ...PERPENDICULAR[side]];
  const fitting = order.find((candidate) => room[candidate] >= needs(candidate));
  if (fitting) return { ...positionOn(fitting), side: fitting, fits: true };

  const roomiest = order.reduce((best, candidate) => (room[candidate] - needs(candidate) > room[best] - needs(best) ? candidate : best));
  const fallback = positionOn(roomiest);
  return { x: clamp(fallback.x, minX, maxX), y: clamp(fallback.y, minY, maxY), side: roomiest, fits: false };
};

/**
 * Calls `onChange` with an element's viewport rectangle now, and again each
 * time it moves or resizes: on scroll (of the page or any scrolling parent),
 * on window resize, and when the element's own size changes. Updates are
 * batched to one per animation frame and only sent when something changed.
 *
 * @returns A function that stops following.
 *
 * @example
 * ```ts
 * const stop = observeRect(target, (rect) => moveHighlight(rect));
 * // later
 * stop();
 * ```
 */
export const observeRect = (element: Element, onChange: (rect: BoxRect) => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;

  let last: BoxRect | null = null;
  let frame = 0;
  let stopped = false;

  const measure = () => {
    frame = 0;
    if (stopped) return;
    const rect = toBoxRect(element.getBoundingClientRect());
    if (sameRect(rect, last)) return;
    last = rect;
    onChange(rect);
  };
  const schedule = () => {
    if (!frame && !stopped) frame = requestAnimationFrame(measure);
  };

  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
  resizeObserver?.observe(element);
  // Capture catches scrolling inside any scrollable parent, not just the page.
  window.addEventListener('scroll', schedule, { capture: true, passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  measure();

  return () => {
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    window.removeEventListener('scroll', schedule, { capture: true });
    window.removeEventListener('resize', schedule);
  };
};
