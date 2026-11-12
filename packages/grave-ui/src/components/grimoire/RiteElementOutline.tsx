/**
 * RiteElementOutline - Traces one element on the page and follows it as it moves
 * @module components/grimoire/RiteElementOutline
 */

import { inspectorColors } from '../../grimoire/tokens';
import { useElementBox } from '../../hooks/useElementBox';
import { RiteHighlight } from './RiteHighlight';

/**
 * Props for {@link RiteElementOutline}.
 */
export interface RiteElementOutlineProps {
  /** The element to trace. */
  element: Element;
  /** Color of the outline. @default inspectorColors.outline */
  color?: string;
  /** `outline` traces the edge; `box-model` tints margin, border, padding, and content. @default 'outline' */
  variant?: 'outline' | 'box-model';
}

/**
 * Traces an element, following it through scrolling and resizing. Use it
 * inside a `RiteLayer` to point at things, such as every element that uses
 * a color.
 *
 * @example
 * ```tsx
 * <RiteLayer>
 *   {matches.map((element, index) => <RiteElementOutline key={index} element={element} />)}
 * </RiteLayer>
 * ```
 */
export const RiteElementOutline = ({ element, color = inspectorColors.outline, variant = 'outline' }: RiteElementOutlineProps) => {
  const { description } = useElementBox(element);
  return description ? <RiteHighlight rects={description.rects} variant={variant} outlineColor={color} /> : null;
};
