/**
 * The Necromancer: takes control of every animation on the page.
 * @module grimoire/rites/necromancer
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';
import { isGrimoireNode } from '../dom/marker';
import { shortSelector } from '../dom/selector';

/** Controlling running animations. */
export const necromancerCapability = defineCapability({
  id: 'necromancer',
  label: 'Web Animations',
  detect: () => typeof document !== 'undefined' && typeof document.getAnimations === 'function',
});

export const necromancerRite = defineRite({
  id: 'necromancer',
  name: 'Necromancer',
  tagline: 'Freezes, slows, and scrubs every animation on the page, then lets them go as they were.',
  sigil: 'hourglass',
  accent: 'moonlight',
  family: 'watching',
  support: { chromium: 'full', firefox: 'full', safari: 'full' },
  capability: necromancerCapability,
});

/** The speeds offered, as multiples of each animation's own speed. */
export const NECROMANCER_SPEEDS = [0.1, 0.25, 0.5, 1, 2] as const;

/** How often the list of animations is read again, in ms. */
export const NECROMANCER_REFRESH_MS = 500;

/** One animation, in plain words, from {@link describeAnimation}. */
export interface AnimationInfo {
  /** The animation itself, for controlling it. */
  animation: Animation;
  /** Its name: the CSS animation or transition name, or its id. */
  name: string;
  /** What it moves, such as `div.dot`, or `null` when it moves nothing on the page. */
  target: string | null;
  /** `running`, `paused`, `finished`, or `idle`. */
  state: AnimationPlayState;
  /** How long one run lasts, in ms, or `null` when it never ends. */
  duration: number | null;
  /** How far through one run it is, from 0 to 1, or `null` when unknown. */
  progress: number | null;
}

const elementOf = (animation: Animation): Element | null => {
  const effect = animation.effect as (AnimationEffect & { target?: Element | null }) | null;
  return effect?.target ?? null;
};

const nameOf = (animation: Animation): string => {
  const named = animation as Animation & { animationName?: string; transitionProperty?: string };
  if (named.animationName) return named.animationName;
  if (named.transitionProperty) return `transition of ${named.transitionProperty}`;
  return animation.id || 'animation';
};

/** Describes one animation for a list. */
export const describeAnimation = (animation: Animation): AnimationInfo => {
  const target = elementOf(animation);
  const timing = animation.effect?.getComputedTiming?.();
  const rawDuration = timing?.duration;
  const duration = typeof rawDuration === 'number' && Number.isFinite(rawDuration) ? rawDuration : null;
  const rawProgress = timing?.progress;
  return {
    animation,
    name: nameOf(animation),
    target: target ? shortSelector(target) : null,
    state: animation.playState,
    duration,
    progress: typeof rawProgress === 'number' ? rawProgress : null,
  };
};

/**
 * Every animation running under `root` (or anywhere on the page), skipping
 * Grimoire's own.
 */
export const listAnimations = (root: Element | Document | null = null): Animation[] => {
  if (typeof document === 'undefined' || typeof document.getAnimations !== 'function') return [];
  const all = root && root !== document && 'getAnimations' in root
    ? (root as Element).getAnimations({ subtree: true })
    : document.getAnimations();
  return all.filter((animation) => !isGrimoireNode(elementOf(animation)));
};
