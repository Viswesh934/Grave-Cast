/**
 * BoxModelDiagram - An element's margin, border, padding, and size, nested like devtools
 * @module components/grimoire/BoxModelDiagram
 */

import type { CSSProperties, ReactNode } from 'react';
import type { BoxSides, BoxSize } from '../../grimoire/dom/geometry';
import { inspectorColors, inspectorFills } from '../../grimoire/tokens';
import { srOnlyStyle } from '../../tokens/accessibility';
import { formatPx, formatSide, formatSize } from './format';
import { riteTokens } from './tokens';

/**
 * Props for {@link BoxModelDiagram}.
 */
export interface BoxModelDiagramProps {
  /** Margin, border, and padding widths, usually `describeElement(element).box`. */
  box: { margin: BoxSides; border: BoxSides; padding: BoxSides };
  /** Size of the content box. */
  content: BoxSize;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the diagram. */
  style?: CSSProperties;
}

const { space, radius, font, line } = riteTokens;

interface RingProps {
  label: string;
  sides: BoxSides;
  fill: string;
  edge: string;
  dashed?: boolean;
  children: ReactNode;
}

const value: CSSProperties = { fontFamily: font.mono, fontSize: font.small, color: riteTokens.surface.text };

/** One layer of the box model, with its four values around what it holds. */
const Ring = ({ label, sides, fill, edge, dashed = false, children }: RingProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(2.5em, auto) 1fr minmax(2.5em, auto)',
      gridTemplateRows: 'auto 1fr auto',
      alignItems: 'center',
      justifyItems: 'center',
      gap: space.xs,
      padding: space.xs,
      background: fill,
      border: `${line.hairline} ${dashed ? 'dashed' : 'solid'} ${edge}`,
      borderRadius: radius.sm,
    }}
  >
    <span
      style={{
        justifySelf: 'start',
        fontSize: font.tiny,
        letterSpacing: font.tracking,
        textTransform: 'uppercase',
        color: riteTokens.surface.text,
      }}
    >
      {label}
    </span>
    <span style={value}>{formatSide(sides.top)}</span>
    <span />
    <span style={value}>{formatSide(sides.left)}</span>
    <div style={{ width: '100%' }}>{children}</div>
    <span style={value}>{formatSide(sides.right)}</span>
    <span />
    <span style={value}>{formatSide(sides.bottom)}</span>
    <span />
  </div>
);

const describeSides = (name: string, sides: BoxSides): string =>
  `${name} ${formatPx(sides.top)}, ${formatPx(sides.right)}, ${formatPx(sides.bottom)}, ${formatPx(sides.left)}`;

/**
 * The box model as people know it from browser devtools: margin around
 * border around padding around the content size, each side labelled.
 * Screen readers get the same numbers as one plain sentence.
 *
 * @example
 * ```tsx
 * const { box, rects } = describeElement(element);
 * <BoxModelDiagram box={box} content={rects.content} />
 * ```
 */
export const BoxModelDiagram = ({ box, content, className, style }: BoxModelDiagramProps) => (
  <figure className={className} style={{ margin: 0, ...style }}>
    <figcaption style={srOnlyStyle}>
      {`Box model. ${describeSides('Margin', box.margin)}. ${describeSides('Border', box.border)}. ${describeSides(
        'Padding',
        box.padding
      )}. Content ${formatPx(content.width)} by ${formatPx(content.height)} pixels. Sides are top, right, bottom, left.`}
    </figcaption>
    <div aria-hidden="true">
      <Ring label="margin" sides={box.margin} fill={inspectorFills.margin} edge={inspectorColors.margin} dashed>
        <Ring label="border" sides={box.border} fill={inspectorFills.border} edge={inspectorColors.border}>
          <Ring label="padding" sides={box.padding} fill={inspectorFills.padding} edge={inspectorColors.padding} dashed>
            <div
              style={{
                ...value,
                padding: `${space.sm} ${space.xs}`,
                textAlign: 'center',
                background: inspectorFills.content,
                border: `${line.hairline} solid ${inspectorColors.content}`,
                borderRadius: radius.sm,
                whiteSpace: 'nowrap',
              }}
            >
              {formatSize(content.width, content.height)}
            </div>
          </Ring>
        </Ring>
      </Ring>
    </div>
  </figure>
);
