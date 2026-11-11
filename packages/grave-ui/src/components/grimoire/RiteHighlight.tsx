/**
 * RiteHighlight - The box model of an element, drawn over the page
 * @module components/grimoire/RiteHighlight
 */

import type { CSSProperties } from 'react';
import type { BoxModelRects } from '../../grimoire/dom/describe';
import type { BoxRect } from '../../grimoire/dom/geometry';
import { inspectorColors, inspectorFills } from '../../grimoire/tokens';
import { RITE_CLASS, riteTokens } from './tokens';

/**
 * Props for {@link RiteHighlight}.
 */
export interface RiteHighlightProps {
  /** The four boxes to draw, usually `describeElement(element).rects`. */
  rects: BoxModelRects;
  /**
   * `box-model` tints the margin, border, padding, and content separately;
   * `outline` only traces the border edge, for a lighter hover. @default 'box-model'
   */
  variant?: 'box-model' | 'outline';
  /** Color of the edge line. @default inspectorColors.outline */
  outlineColor?: string;
}

const { minHighlight } = riteTokens.size;

const place = (rect: BoxRect): CSSProperties => ({
  position: 'absolute',
  left: rect.x,
  top: rect.y,
  width: Math.max(minHighlight, rect.width),
  height: Math.max(minHighlight, rect.height),
  boxSizing: 'border-box',
});

/** A frame that fills the gap between `outer` and `inner` with `color`. */
const ring = (outer: BoxRect, inner: BoxRect, color: string): CSSProperties => ({
  ...place(outer),
  borderStyle: 'solid',
  borderColor: color,
  borderTopWidth: Math.max(0, inner.y - outer.y),
  borderLeftWidth: Math.max(0, inner.x - outer.x),
  borderRightWidth: Math.max(0, outer.x + outer.width - (inner.x + inner.width)),
  borderBottomWidth: Math.max(0, outer.y + outer.height - (inner.y + inner.height)),
});

/**
 * Draws an element's box model the way browser devtools do: margin, border,
 * padding, and content each in their own tint, with the border edge traced.
 * Each area is drawn once, so the tints never stack into muddy colors.
 *
 * Place it inside a {@link RiteLayer}, which positions it in viewport pixels.
 * It glides between elements, unless the user prefers reduced motion.
 *
 * @example
 * ```tsx
 * <RiteLayer>
 *   <RiteHighlight rects={description.rects} />
 * </RiteLayer>
 * ```
 */
export const RiteHighlight = ({ rects, variant = 'box-model', outlineColor = inspectorColors.outline }: RiteHighlightProps) => {
  const edge: CSSProperties = {
    ...place(rects.border),
    outline: `${riteTokens.line.highlight} solid ${outlineColor}`,
  };

  return (
    <div className={RITE_CLASS.highlight}>
      {variant === 'box-model' && (
        <>
          <div style={ring(rects.margin, rects.border, inspectorFills.margin)} />
          <div style={ring(rects.border, rects.padding, inspectorFills.border)} />
          <div style={ring(rects.padding, rects.content, inspectorFills.padding)} />
          <div style={{ ...place(rects.content), background: inspectorFills.content }} />
        </>
      )}
      <div style={edge} />
    </div>
  );
};
