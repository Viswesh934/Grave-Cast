/**
 * ColorSwatch - A color chip with its value, optionally selectable
 * @module components/grimoire/ColorSwatch
 */

import type { CSSProperties, ReactNode } from 'react';
import { formatHex, formatRgb, type Rgba } from '../../grimoire/color/parse';
import { grimoireShades } from '../../grimoire/tokens';
import { withAlpha } from '../../tokens/colors';
import { RITE_CLASS, RITE_VARS, riteTokens } from './tokens';

/**
 * Props for {@link ColorSwatch}.
 */
export interface ColorSwatchProps {
  /** The color to show. */
  color: Rgba;
  /** The text beside the chip. @default the hex value */
  label?: string;
  /** Extra text after the label, such as how often the color is used. */
  detail?: ReactNode;
  /** Words for screen readers in place of `detail`, such as "used 12 times". */
  description?: string;
  /** Makes the swatch a toggle button. */
  onSelect?: () => void;
  /** Whether the swatch is chosen. Only used with `onSelect`. */
  selected?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the swatch. */
  style?: CSSProperties;
}

/** Size of one checkerboard square, shown through see-through colors. */
const CHECKER_TILE = '8px';

/** How visible the chip's inner edge is, so dark colors still stand out on dark panels. */
const CHIP_EDGE_STRENGTH = 30;

const { space, radius, font, line } = riteTokens;
const surface = riteTokens.surface;

const checker = `repeating-conic-gradient(${grimoireShades.binding} 0 25%, ${grimoireShades.vellum} 0 50%) 50% / ${CHECKER_TILE} ${CHECKER_TILE}`;

/**
 * A color chip with its hex value. See-through colors show a checkerboard
 * behind them. With `onSelect` it becomes a toggle button with a visible
 * focus ring and a pressed state.
 *
 * Inside a `RiteShell` the hover and focus styles are already on the page;
 * on its own, render `<RiteStyles />` once nearby.
 *
 * @example
 * ```tsx
 * <ColorSwatch color={parseColor('#8b5cf6')!} detail="×12" description="used 12 times" />
 * ```
 */
export const ColorSwatch = ({ color, label, detail, description, onSelect, selected = false, className, style }: ColorSwatchProps) => {
  const text = label ?? formatHex(color);
  const css = formatRgb(color);
  const shared: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.sm,
    padding: `${space.xs} ${space.sm} ${space.xs} ${space.xs}`,
    borderRadius: radius.md,
    border: `${line.hairline} solid ${selected ? `var(${RITE_VARS.accent}, ${surface.focus})` : surface.border}`,
    background: surface.raised,
    color: surface.text,
    fontFamily: font.mono,
    fontSize: font.small,
    textAlign: 'left',
    ...style,
  };
  const content = (
    <>
      <span
        aria-hidden="true"
        style={{
          width: riteTokens.size.swatch,
          height: riteTokens.size.swatch,
          flexShrink: 0,
          borderRadius: radius.sm,
          background: `linear-gradient(${css}, ${css}), ${checker}`,
          boxShadow: `inset 0 0 0 ${line.hairline} ${withAlpha(surface.text, CHIP_EDGE_STRENGTH)}`,
        }}
      />
      <span>{text}</span>
      {detail !== undefined && <span style={{ color: surface.muted }}>{detail}</span>}
    </>
  );
  const name = description ? `${text}, ${description}` : undefined;
  const classes = [RITE_CLASS.swatch, className].filter(Boolean).join(' ');

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={name} className={classes} style={{ ...shared, cursor: 'pointer' }}>
        {content}
      </button>
    );
  }
  return (
    <span role={name ? 'img' : undefined} aria-label={name} className={classes} style={shared}>
      {content}
    </span>
  );
};
