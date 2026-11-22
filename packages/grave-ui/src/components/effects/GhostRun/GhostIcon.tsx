/**
 * GhostIcon - a small ghost, looking left, for buttons and labels
 * @module components/effects/GhostRun/GhostIcon
 */

export interface GhostIconProps {
  /** Width and height, as a number of pixels or any CSS length. @default '1em' */
  size?: number | string;
  /** Fill colour. @default 'currentColor', so it follows the text colour */
  color?: string;
  /** A name for screen readers. Leave out when the icon sits beside its own text or label. */
  title?: string;
  className?: string;
}

/** The ghost's outline, with its eyes cut out (even-odd fill), on a 24 by 24 grid. */
const GHOST_PATH =
  'M12 2a8 8 0 0 0-8 8v12l2.67-2 2.66 2L12 20l2.67 2 2.66-2L20 22V10a8 8 0 0 0-8-8z' +
  'M10 10.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 1 1 3 0z' +
  'M14.5 10.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 1 1 3 0z';

/**
 * A ghost drawn in one colour, with its eyes cut out so the background shows through.
 *
 * @example
 * ```tsx
 * <button aria-label="Play Ghost run"><GhostIcon size={20} /></button>
 * ```
 */
export const GhostIcon = ({ size = '1em', color = 'currentColor', title, className }: GhostIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
    focusable="false"
  >
    {title && <title>{title}</title>}
    <path d={GHOST_PATH} fill={color} fillRule="evenodd" />
  </svg>
);
