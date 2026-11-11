/**
 * Grimoire components: the frame every rite lives in, page overlays, and the
 * small pieces rites share.
 * @module components/grimoire
 */

import { createElement } from 'react';
import { riteStyles } from './tokens';

export { RiteShell, type RiteShellProps, type RiteShellControls } from './RiteShell';
export { RiteLayer, type RiteLayerProps } from './RiteLayer';
export { RiteHighlight, type RiteHighlightProps } from './RiteHighlight';
export { RiteLabel, type RiteLabelProps } from './RiteLabel';
export { RiteSigil, SIGIL_GLYPHS, type RiteSigilProps, type SigilGlyph } from './RiteSigil';
export { BoxModelDiagram, type BoxModelDiagramProps } from './BoxModelDiagram';
export { ColorSwatch, type ColorSwatchProps } from './ColorSwatch';
export { ContrastBadge, type ContrastBadgeProps } from './ContrastBadge';
export { formatPx, formatSide, formatSize } from './format';
export {
  riteTokens,
  riteStatusMeta,
  riteStyles,
  accentGlow,
  RITE_CLASS,
  RITE_VARS,
} from './tokens';

/**
 * The hover, focus, and motion styles Grimoire components share. `RiteShell`
 * and `RiteLayer` include them; render this once if you use swatches or
 * badges on their own.
 */
export const RiteStyles = () => createElement('style', null, riteStyles);
