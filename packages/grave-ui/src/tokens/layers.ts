/**
 * Stacking order (z-index) tokens for Grave-UI
 * @module tokens/layers
 */

/**
 * One shared z-index scale, from behind the page to above everything.
 *
 * - `behind`: backdrops placed behind their container's content. The container
 *   needs `isolation: isolate`.
 * - `base`: normal page content.
 * - `raised`: content that sits on top of its siblings, such as a prompt.
 * - `overlay`: the dimmed layer behind a dialog.
 * - `modal`: dialogs, drawers, and portals.
 * - `toast`: short messages that must show above dialogs.
 * - `annotation`: drawing over the page with Scribble, above any app UI.
 * - `inspector`: Grimoire overlays (highlights, labels, panels). They sit
 *   above any app UI, including third-party widgets with very high values,
 *   so what they point at is never covered.
 * - `cursor`: a custom cursor. The highest value browsers allow.
 *
 * @example
 * ```tsx
 * import { zLayers } from 'groove-ui/tokens';
 *
 * <div style={{ position: 'fixed', zIndex: zLayers.modal }} />
 * ```
 */
export const zLayers = {
  behind: -1,
  base: 0,
  raised: 10,
  overlay: 999,
  modal: 1000,
  toast: 1100,
  annotation: 2147483645,
  inspector: 2147483646,
  cursor: 2147483647,
} as const;

/** The name of one stacking layer. */
export type ZLayer = keyof typeof zLayers;
