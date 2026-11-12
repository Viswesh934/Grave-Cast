/**
 * RiteLabel - A small tag that sits beside what it describes, never on top of it
 * @module components/grimoire/RiteLabel
 */

import { useRef, useState, type ReactNode } from 'react';
import { placeNear, sameRect, type BoxRect, type PlacementSide } from '../../grimoire/dom/geometry';
import { inspectorColors } from '../../grimoire/tokens';
import { useEventListener } from '../../hooks/useEventListener';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { RITE_CLASS, riteTokens } from './tokens';

/**
 * Props for {@link RiteLabel}.
 */
export interface RiteLabelProps {
  /** The rectangle the label describes, in viewport pixels. */
  anchor: BoxRect;
  /** What the label says. */
  children: ReactNode;
  /** The side to try first. @default 'top' */
  side?: PlacementSide;
  /** Color of the label's left edge. @default inspectorColors.label.accent */
  accent?: string;
}

const viewportSize = () => ({ width: window.innerWidth, height: window.innerHeight });

/**
 * A floating tag for an overlay, such as an element's name and size. It is
 * measured after each render and placed beside its anchor with `placeNear`,
 * flipping sides and sliding along the edge so it stays fully on screen and
 * off the thing it describes whenever there is room.
 *
 * Place it inside a {@link RiteLayer}.
 *
 * @example
 * ```tsx
 * <RiteLabel anchor={rects.border}>
 *   <strong>h2.title</strong> 320 × 48
 * </RiteLabel>
 * ```
 */
export const RiteLabel = ({ anchor, children, side = 'top', accent = inspectorColors.label.accent }: RiteLabelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<BoxRect | null>(null);
  const [viewport, setViewport] = useState(() => (typeof window === 'undefined' ? { width: 0, height: 0 } : viewportSize()));

  useEventListener('window', 'resize', () => setViewport(viewportSize()), { passive: true });

  // Measure before paint, so the label never flashes in the wrong place.
  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measured = { x: 0, y: 0, width: node.offsetWidth, height: node.offsetHeight };
    setSize((current) => (sameRect(current, measured) ? current : measured));
  });

  const placement = size ? placeNear(anchor, size, viewport, { side }) : null;

  return (
    <div
      ref={ref}
      className={placement ? RITE_CLASS.label : undefined}
      style={{
        position: 'absolute',
        left: placement?.x ?? 0,
        top: placement?.y ?? 0,
        visibility: placement ? 'visible' : 'hidden',
        maxWidth: riteTokens.size.labelMaxWidth,
        padding: `${riteTokens.space.xs} ${riteTokens.space.sm}`,
        background: inspectorColors.label.background,
        color: inspectorColors.label.text,
        border: `${riteTokens.line.hairline} solid ${inspectorColors.label.border}`,
        borderLeft: `${riteTokens.line.focus} solid ${accent}`,
        borderRadius: riteTokens.radius.sm,
        boxShadow: riteTokens.shadow,
        fontFamily: riteTokens.font.mono,
        fontSize: riteTokens.font.small,
        lineHeight: riteTokens.font.lineHeight,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {children}
    </div>
  );
};
