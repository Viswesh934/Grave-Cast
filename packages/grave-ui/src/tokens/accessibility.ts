/**
 * Accessibility style tokens for Grave-UI
 * @module tokens/accessibility
 */

/**
 * Hides content from sight while keeping it readable by screen readers.
 * Use it for live regions and labels that only assistive technology needs.
 *
 * Not for media that must keep playing while hidden: use a component's own
 * offscreen style for that.
 *
 * @example
 * ```tsx
 * import { srOnlyStyle } from 'groove-ui/tokens';
 *
 * <span style={srOnlyStyle}>Opens in a new tab</span>
 * ```
 */
export const srOnlyStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;
