/**
 * RiteLayer - A see-through layer over the whole page for Grimoire overlays
 * @module components/grimoire/RiteLayer
 */

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { grimoireIgnoreProps } from '../../grimoire/dom/marker';
import { riteStyles, riteTokens } from './tokens';

/**
 * Props for {@link RiteLayer}.
 */
export interface RiteLayerProps {
  /** Highlights, labels, and guides, positioned in viewport pixels. */
  children?: ReactNode;
  /** Where the layer is placed. @default document.body */
  container?: Element | null;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the layer. */
  style?: CSSProperties;
}

/**
 * A fixed layer that covers the viewport above everything else, for drawing
 * over the page. Clicks and the pointer pass straight through it, it is hidden
 * from screen readers (say what matters in visible text or with
 * `useAriaAnnounce`), and Grimoire's own tools never inspect it.
 *
 * Renders nothing during server rendering; it appears after the page loads.
 *
 * @example
 * ```tsx
 * <RiteLayer>
 *   <RiteHighlight rects={description.rects} />
 *   <RiteLabel anchor={description.rects.border}>{description.label}</RiteLabel>
 * </RiteLayer>
 * ```
 */
export const RiteLayer = ({ children, container, className, style }: RiteLayerProps) => {
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    setTarget(container ?? document.body);
  }, [container]);

  if (!target) return null;

  return createPortal(
    <div
      {...grimoireIgnoreProps}
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: riteTokens.layer,
        ...style,
      }}
    >
      <style>{riteStyles}</style>
      {children}
    </div>,
    target
  );
};
