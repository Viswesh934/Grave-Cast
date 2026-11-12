/**
 * The Apparition: changes appear and vanish with a transition, using View Transitions where they exist.
 * @module grimoire/rites/apparition
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';

/** Animating changes. Always available: browsers without View Transitions get a fade. */
export const apparitionCapability = defineCapability({
  id: 'apparition',
  label: 'View Transitions',
  detect: () => typeof document !== 'undefined',
});

export const apparitionRite = defineRite({
  id: 'apparition',
  name: 'Apparition',
  tagline: 'Makes changes fade, slide, or rise into place instead of snapping, and respects people who ask for less motion.',
  sigil: 'mirror',
  accent: 'witchfire',
  family: 'binding',
  support: {
    chromium: 'full',
    firefox: 'full',
    safari: 'full',
    note: 'Older browsers without View Transitions get a simple fade.',
  },
  capability: apparitionCapability,
});

/** The ways a change can appear. */
export const APPARITION_PRESETS = ['fade', 'slide', 'rise', 'blur', 'flip'] as const;
export type ApparitionPreset = (typeof APPARITION_PRESETS)[number];

/** How long a transition lasts unless told otherwise, in ms. */
export const APPARITION_DURATION_MS = 450;
/** Shortest and longest durations offered, in ms. */
export const APPARITION_MIN_MS = 150;
export const APPARITION_MAX_MS = 1500;

/** The transition name given to the element while it changes. */
export const APPARITION_NAME = 'grimoire-apparition';
/** Set on the page root while a transition runs, naming the preset. */
export const APPARITION_ATTRIBUTE = 'data-grimoire-apparition';
/** Holds the duration while a transition runs. */
export const APPARITION_DURATION_VAR = '--grimoire-apparition-ms';
const STYLE_ID = 'grimoire-apparition-styles';

/** How far things move or turn in each preset. */
export const apparitionMotion = {
  slide: '2.5rem',
  rise: '1.5rem',
  blur: '6px',
  flipDegrees: 90,
  /** Distance to the viewer in the flip, so it turns in depth. */
  perspective: '60rem',
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

/** Each preset's outgoing and incoming keyframes. */
const KEYFRAMES: Record<ApparitionPreset, { out: string; in: string }> = {
  fade: { out: 'to { opacity: 0; }', in: 'from { opacity: 0; }' },
  slide: {
    out: `to { opacity: 0; transform: translateX(-${apparitionMotion.slide}); }`,
    in: `from { opacity: 0; transform: translateX(${apparitionMotion.slide}); }`,
  },
  rise: {
    out: `to { opacity: 0; transform: translateY(-${apparitionMotion.rise}); }`,
    in: `from { opacity: 0; transform: translateY(${apparitionMotion.rise}); }`,
  },
  blur: { out: `to { opacity: 0; filter: blur(${apparitionMotion.blur}); }`, in: `from { opacity: 0; filter: blur(${apparitionMotion.blur}); }` },
  flip: {
    out: `to { opacity: 0; transform: perspective(${apparitionMotion.perspective}) rotateY(${apparitionMotion.flipDegrees}deg); }`,
    in: `from { opacity: 0; transform: perspective(${apparitionMotion.perspective}) rotateY(-${apparitionMotion.flipDegrees}deg); }`,
  },
};

/** The stylesheet behind every preset. Injected once by {@link summon}. */
export const apparitionStyles = (): string =>
  APPARITION_PRESETS.map((preset) => {
    const frames = KEYFRAMES[preset];
    const selector = `:root[${APPARITION_ATTRIBUTE}="${preset}"]`;
    const timing = `var(${APPARITION_DURATION_VAR}, ${APPARITION_DURATION_MS}ms) ${apparitionMotion.easing} both`;
    return `@keyframes grimoire-${preset}-out { ${frames.out} }
@keyframes grimoire-${preset}-in { ${frames.in} }
${selector}::view-transition-old(${APPARITION_NAME}) { animation: grimoire-${preset}-out ${timing}; }
${selector}::view-transition-new(${APPARITION_NAME}) { animation: grimoire-${preset}-in ${timing}; }`;
  }).join('\n');

const ensureStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = apparitionStyles();
  document.head.append(style);
};

/** Whether the person asked their device for less motion. */
export const prefersLessMotion = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * How a change was shown.
 *
 * - `view-transition`: the browser's View Transitions, with the preset
 * - `fade`: a simple fade, where View Transitions are missing
 * - `instant`: no motion, because less motion was asked for
 */
export type ApparitionMode = 'view-transition' | 'fade' | 'instant';

/**
 * Options for {@link summon}.
 */
export interface SummonOptions {
  /** The element that changes. Only it moves; the rest of the page stays still. */
  element: HTMLElement;
  /** @default 'fade' */
  preset?: ApparitionPreset;
  /** @default APPARITION_DURATION_MS */
  durationMs?: number;
  /** Ignore the person's reduced-motion setting. Rarely right. @default false */
  ignoreReducedMotion?: boolean;
}

interface ViewTransitionLike {
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}

type StartViewTransition = (update: () => void | Promise<void>) => ViewTransitionLike;

/**
 * Runs `update` (which changes `element`, for example by setting React
 * state with `flushSync`) and animates the change. Resolves once the change
 * has been made and the motion has finished, with the mode that was used.
 *
 * @example
 * ```ts
 * await summon(() => flushSync(() => setPage(next)), { element: card, preset: 'slide' });
 * ```
 */
export const summon = async (update: () => void | Promise<void>, options: SummonOptions): Promise<ApparitionMode> => {
  const { element, preset = 'fade', durationMs = APPARITION_DURATION_MS, ignoreReducedMotion = false } = options;
  if (!ignoreReducedMotion && prefersLessMotion()) {
    await update();
    return 'instant';
  }

  const start = (document as Document & { startViewTransition?: StartViewTransition }).startViewTransition;
  if (typeof start === 'function') {
    ensureStyles();
    const root = document.documentElement;
    const previousName = element.style.getPropertyValue('view-transition-name');
    element.style.setProperty('view-transition-name', APPARITION_NAME);
    root.setAttribute(APPARITION_ATTRIBUTE, preset);
    root.style.setProperty(APPARITION_DURATION_VAR, `${durationMs}ms`);
    try {
      const transition = start.call(document, update);
      await transition.updateCallbackDone;
      await transition.finished.catch(() => undefined);
    } finally {
      root.removeAttribute(APPARITION_ATTRIBUTE);
      root.style.removeProperty(APPARITION_DURATION_VAR);
      if (previousName) element.style.setProperty('view-transition-name', previousName);
      else element.style.removeProperty('view-transition-name');
      if (root.getAttribute('style') === '') root.removeAttribute('style');
    }
    return 'view-transition';
  }

  await update();
  if (typeof element.animate === 'function') {
    await element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: durationMs, easing: apparitionMotion.easing }).finished.catch(() => undefined);
  }
  return 'fade';
};
