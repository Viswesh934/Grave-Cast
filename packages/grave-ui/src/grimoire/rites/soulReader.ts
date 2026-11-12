/**
 * The Soul Reader: the true colors of a page, and the words nobody can read.
 * @module grimoire/rites/soulReader
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';
import { textContrast, type TextContrast } from '../dom/background';
import { shortSelector } from '../dom/selector';
import { walkText } from '../dom/text';

/** What the Soul Reader needs: reading computed styles. */
export const soulReaderCapability = defineCapability({
  id: 'soul-reader',
  label: 'Reading page colors',
  detect: () => typeof getComputedStyle === 'function',
});

/** Picking a color from anywhere on the screen (Chrome and Edge). */
export const eyeDropperCapability = defineCapability({
  id: 'eye-dropper',
  label: 'EyeDropper',
  secure: true,
  detect: () => 'EyeDropper' in window,
});

export const soulReaderRite = defineRite({
  id: 'soul-reader',
  name: 'Soul Reader',
  tagline: 'Reads the true colors of a page, finds words that cannot be read, and steals any color from the screen.',
  sigil: 'prism',
  accent: 'moonlight',
  family: 'seeing',
  support: {
    chromium: 'full',
    firefox: 'partial',
    safari: 'partial',
    note: 'Picking a color from the screen works in Chrome and Edge only.',
  },
  capability: soulReaderCapability,
});

/** Most elements checked by default, to stay quick on large pages. */
export const AUDIT_MAX_ELEMENTS = 2000;

/** Most characters of an element's text kept in an issue. */
export const AUDIT_TEXT_LIMIT = 60;

/**
 * One piece of text that is hard to read, from {@link auditContrast}.
 */
export interface ContrastIssue {
  element: Element;
  /** A short label, such as `p.caption`. */
  label: string;
  /** The start of its text. */
  text: string;
  contrast: TextContrast;
}

/**
 * The result of {@link auditContrast}.
 */
export interface ContrastAudit {
  /** Text below WCAG AA for its size, hardest to read first. */
  issues: ContrastIssue[];
  /** How many elements with text were checked. */
  checked: number;
  /** `true` when `maxElements` was reached before the end. */
  truncated: boolean;
}

/** Whether an element is shown at all, using the browser's own check where it has one. */
const isShown = (element: Element): boolean => {
  const check = (element as Element & { checkVisibility?: () => boolean }).checkVisibility;
  if (typeof check === 'function' && !check.call(element)) return false;
  const style = getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse' && style.opacity !== '0';
};

/**
 * Checks every visible piece of text under `root` against its real
 * background and lists the ones below WCAG AA, hardest to read first.
 *
 * Each element is checked once, for the text it shows itself. Results where
 * the background had to be estimated say so in `contrast.certain`.
 *
 * @example
 * ```ts
 * const { issues } = auditContrast(document.body);
 * issues.forEach(({ label, contrast }) => console.log(label, contrast.ratio));
 * ```
 */
export const auditContrast = (root: Element, options: { maxElements?: number } = {}): ContrastAudit => {
  const { maxElements = AUDIT_MAX_ELEMENTS } = options;
  const elements: Element[] = [];
  const seen = new Set<Element>();
  let truncated = false;

  for (const node of walkText(root)) {
    const parent = node.parentElement;
    if (!parent || seen.has(parent)) continue;
    if (elements.length >= maxElements) {
      truncated = true;
      break;
    }
    seen.add(parent);
    elements.push(parent);
  }

  const issues: ContrastIssue[] = [];
  for (const element of elements) {
    if (!isShown(element)) continue;
    const contrast = textContrast(element);
    if (contrast.rating !== 'fail') continue;
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
    issues.push({
      element,
      label: shortSelector(element),
      text: text.length > AUDIT_TEXT_LIMIT ? `${text.slice(0, AUDIT_TEXT_LIMIT - 1)}…` : text,
      contrast,
    });
  }

  issues.sort((a, b) => a.contrast.ratio - b.contrast.ratio);
  return { issues, checked: elements.length, truncated };
};
