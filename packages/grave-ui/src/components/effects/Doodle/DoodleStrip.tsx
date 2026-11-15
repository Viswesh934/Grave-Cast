/**
 * DoodleStrip: a comic page of doodles. Every panel shows at once, framed and
 * numbered, so it can be read in a hurry without tapping through steps.
 * @module components/effects/Doodle/DoodleStrip
 */
import { useId, type CSSProperties } from 'react';
import { Doodle } from './Doodle';
import { doodleRegistry } from './render';
import { doodleChrome, doodleComic } from './tokens';
import type { DoodleRegistry, DoodleStripSpec } from './types';

export interface DoodleStripProps {
  /** The strip: its title, panels, and source. */
  strip: DoodleStripSpec;
  /** Poses and props to draw with. Defaults to the built-in library. */
  registry?: DoodleRegistry;
  /** The heading level for the strip's title, to fit the page's outline. @default 2 */
  headingLevel?: 2 | 3 | 4;
  /** Draw the panels in, as if by hand. Off when the person asks for less motion. @default true */
  draw?: boolean;
  /** Show the source under the strip. @default true */
  showSource?: boolean;
  className?: string;
  style?: CSSProperties;
}

const styles = {
  root: {
    display: 'grid',
    gap: doodleChrome.gap,
    padding: doodleChrome.padding,
    background: doodleChrome.surface,
    border: `${doodleChrome.borderWidth} solid ${doodleChrome.border}`,
    borderRadius: doodleChrome.radius,
    color: doodleChrome.text,
    fontFamily: doodleChrome.font,
  },
  heading: { margin: 0, fontSize: doodleChrome.captionSize },
  page: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${doodleComic.panelMinWidth}), 1fr))`,
    gap: doodleComic.gutter,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  panel: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: doodleComic.panelSurface,
    border: `${doodleComic.panelBorderWidth} solid ${doodleComic.panelBorder}`,
    borderRadius: doodleComic.panelRadius,
  },
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'grid',
    placeItems: 'center',
    width: doodleComic.badgeSize,
    height: doodleComic.badgeSize,
    background: doodleComic.badgeSurface,
    color: doodleComic.badgeText,
    fontSize: doodleComic.badgeFontSize,
    fontWeight: 'bold',
    borderBottomRightRadius: doodleComic.panelRadius,
  },
  caption: {
    flex: 1,
    margin: 0,
    padding: doodleComic.captionPadding,
    background: doodleComic.captionSurface,
    borderTop: `${doodleComic.panelBorderWidth} solid ${doodleComic.panelBorder}`,
    fontSize: doodleChrome.captionSize,
    lineHeight: doodleChrome.captionLineHeight,
  },
  source: { margin: 0, color: doodleChrome.muted, fontSize: doodleChrome.smallSize },
  link: { color: doodleChrome.text },
} satisfies Record<string, CSSProperties>;

/**
 * Shows a strip as a comic page: every panel at once, numbered, with its step
 * as real text under the drawing. Panels sit side by side when there is room
 * and stack on narrow screens. Screen readers hear an ordered list of steps.
 *
 * @example
 * ```tsx
 * <DoodleStrip strip={nightWatch} headingLevel={3} />
 * ```
 */
export const DoodleStrip = ({
  strip,
  registry = doodleRegistry,
  headingLevel = 2,
  draw = true,
  showSource = true,
  className,
  style,
}: DoodleStripProps) => {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  const source = strip.source;

  return (
    <section aria-labelledby={headingId} className={className} style={{ ...styles.root, ...style }}>
      <Heading id={headingId} style={styles.heading}>
        {strip.title}
      </Heading>

      <ol style={styles.page}>
        {strip.panels.map((panel, index) => (
          <li key={panel.id} style={styles.panel}>
            <span aria-hidden="true" style={styles.badge}>
              {index + 1}
            </span>
            <Doodle doodle={panel.doodle} description={panel.description} registry={registry} draw={draw} />
            <p style={styles.caption}>{panel.caption}</p>
          </li>
        ))}
      </ol>

      {showSource && source && (
        <p style={styles.source}>
          Source:{' '}
          {source.url ? (
            <a href={source.url} target="_blank" rel="noreferrer" style={styles.link}>
              {source.name}
            </a>
          ) : (
            source.name
          )}
        </p>
      )}
    </section>
  );
};
