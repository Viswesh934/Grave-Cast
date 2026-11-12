/**
 * Small style pieces shared by the rite panels.
 * @module components/grimoire/rites/styles
 */

import type { CSSProperties } from 'react';
import { RITE_VARS, riteTokens } from '../tokens';

const { space, radius, font, line } = riteTokens;
const surface = riteTokens.surface;

/** The rite's accent color, from the shell around it. */
export const ACCENT_VAR = `var(${RITE_VARS.accent}, ${surface.focus})`;

/** Narrowest a column gets before panels stack into one column. */
export const COLUMN_MIN = '14rem';

/** A wrapping row of controls. */
export const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: space.sm };

/** A vertical stack of sections. */
export const stack: CSSProperties = { display: 'grid', gap: space.xl };

/** Columns that stack when there is no room. */
export const columns: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${COLUMN_MIN}, 1fr))`,
  gap: space.xl,
};

/** Quiet explanatory text. */
export const note: CSSProperties = { margin: 0, fontSize: font.small, color: surface.muted, lineHeight: font.lineHeight };

/** An element name or value set in code type. */
export const codeTag: CSSProperties = {
  fontFamily: font.mono,
  fontSize: font.base,
  color: surface.text,
  background: surface.raised,
  padding: `${space.xs} ${space.sm}`,
  borderRadius: radius.sm,
  overflowWrap: 'anywhere',
};

/** A small rounded label, lit by the accent when `on`. */
export const chip = (on: boolean): CSSProperties => ({
  fontFamily: font.mono,
  fontSize: font.tiny,
  padding: `${space.xs} ${space.sm}`,
  borderRadius: radius.pill,
  border: `${line.hairline} solid ${on ? ACCENT_VAR : surface.border}`,
  color: on ? surface.text : surface.muted,
  whiteSpace: 'nowrap',
});

/** A keyboard key. */
export const kbd: CSSProperties = {
  fontFamily: font.mono,
  padding: `0 ${space.xs}`,
  border: `${line.hairline} solid ${surface.border}`,
  borderRadius: radius.sm,
  color: surface.text,
};

/** A thin upright divider between groups of buttons. */
export const divider: CSSProperties = {
  alignSelf: 'stretch',
  width: line.hairline,
  margin: `0 ${space.xs}`,
  background: surface.border,
};

/** A list with no bullets or spacing of its own. */
export const plainList: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: space.xs };
