/**
 * The Poltergeist: watches every change on the page, and makes a few of its own.
 * @module grimoire/rites/poltergeist
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';
import type { DomJournal } from '../dom/journal';
import { isGrimoireNode } from '../dom/marker';
import { shortSelector } from '../dom/selector';
import { findText, walkText, type FindTextOptions, type TextMatch } from '../dom/text';

/** Watching the page change. */
export const poltergeistCapability = defineCapability({
  id: 'poltergeist',
  label: 'MutationObserver',
  detect: () => typeof MutationObserver === 'function',
});

export const poltergeistRite = defineRite({
  id: 'poltergeist',
  name: 'Poltergeist',
  tagline: 'Notices every change to the page, rewrites words on command, and puts everything back when banished.',
  sigil: 'ghost',
  accent: 'blood',
  family: 'watching',
  support: { chromium: 'full', firefox: 'full', safari: 'full' },
  capability: poltergeistCapability,
});

/** Most characters of changed text shown in a log entry. */
export const MUTATION_TEXT_LIMIT = 40;

/**
 * What kind of change happened.
 *
 * - `added` and `removed`: an element or some text came or went
 * - `text`: words changed
 * - `attribute`: an attribute such as `class` or `hidden` changed
 */
export type MutationKind = 'added' | 'removed' | 'text' | 'attribute';

/** One change, in words, from {@link describeMutation}. */
export interface MutationSummary {
  kind: MutationKind;
  /** Where it happened, such as `p.intro`. */
  label: string;
  /** What changed, such as `"Hello" → "Goodbye"`. */
  detail: string;
}

const clip = (text: string | null | undefined): string => {
  const flat = (text ?? '').replace(/\s+/g, ' ').trim();
  return flat.length > MUTATION_TEXT_LIMIT ? `${flat.slice(0, MUTATION_TEXT_LIMIT - 1)}…` : flat;
};

const labelOf = (node: Node | null): string => {
  if (!node) return 'the page';
  if (node.nodeType === Node.ELEMENT_NODE) return shortSelector(node as Element);
  return node.parentElement ? `text in ${shortSelector(node.parentElement)}` : 'text';
};

/** Whether an added or removed node is worth mentioning (not just spaces). */
const worthMentioning = (node: Node): boolean =>
  node.nodeType === Node.ELEMENT_NODE || (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '');

/** Turns one `MutationRecord` into plain-language changes. */
export const describeMutation = (record: MutationRecord): MutationSummary[] => {
  if (record.type === 'characterData') {
    return [{ kind: 'text', label: labelOf(record.target), detail: `“${clip(record.oldValue)}” → “${clip(record.target.textContent)}”` }];
  }
  if (record.type === 'attributes') {
    const element = record.target as Element;
    const name = record.attributeName ?? 'attribute';
    const now = element.getAttribute(name);
    const detail = now === null ? `${name} removed` : `${name}: ${clip(record.oldValue) || 'none'} → ${clip(now) || 'empty'}`;
    return [{ kind: 'attribute', label: labelOf(element), detail }];
  }
  const where = labelOf(record.target);
  return [
    ...[...record.addedNodes].filter(worthMentioning).map((node) => ({ kind: 'added' as const, label: labelOf(node), detail: `into ${where}: ${clip(node.textContent) || 'empty'}` })),
    ...[...record.removedNodes].filter(worthMentioning).map((node) => ({ kind: 'removed' as const, label: labelOf(node), detail: `from ${where}: ${clip(node.textContent) || 'empty'}` })),
  ];
};

/**
 * Replaces every match of `query` under `root` with `replacement`, as one
 * undoable step in `journal`. Returns how many matches were replaced.
 *
 * @example
 * ```ts
 * const journal = createDomJournal();
 * replaceAllText(document.body, 'night', 'day', journal);
 * journal.undo(); // every word is back
 * ```
 */
export const replaceAllText = (
  root: Node,
  query: string,
  replacement: string,
  journal: DomJournal,
  options: FindTextOptions = {}
): number => {
  const matches = findText(root, query, options);
  if (matches.length === 0) return 0;
  const byNode = new Map<Text, TextMatch[]>();
  for (const match of matches) byNode.set(match.node, [...(byNode.get(match.node) ?? []), match]);

  journal.batch(`Replaced “${clip(query)}” with “${clip(replacement)}”`, () => {
    byNode.forEach((nodeMatches, node) => {
      let data = node.data;
      // From the end back, so earlier offsets stay correct.
      for (const match of [...nodeMatches].sort((a, b) => b.start - a.start)) {
        data = data.slice(0, match.start) + replacement + data.slice(match.end);
      }
      journal.setText(node, data);
    });
  });
  return matches.length;
};

/** Puts items in a random order (a new array; the input is left alone). */
export const shuffled = <T>(items: readonly T[], random: () => number = Math.random): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

/** Elements the Poltergeist may hide. */
export const HIDEABLE_SELECTOR = 'p, li, img, button, h3, h4, label, figure';

/** Lists whose items the Poltergeist may shuffle. */
export const SHUFFLEABLE_SELECTOR = 'ul, ol';

const pick = <T>(items: readonly T[], random: () => number): T | undefined => items[Math.floor(random() * items.length)];

const notOurs = (element: Element) => !isGrimoireNode(element);

/**
 * Shuffles the items of the first list under `root` with two or more items,
 * as one undoable step. Returns the list, or `null` when there is none.
 */
export const shuffleList = (root: Element, journal: DomJournal, random: () => number = Math.random): Element | null => {
  const list = [...root.querySelectorAll(SHUFFLEABLE_SELECTOR)].find((candidate) => notOurs(candidate) && candidate.children.length > 1);
  if (!list) return null;
  const order = shuffled([...list.children], random);
  journal.batch(`Shuffled ${shortSelector(list)}`, () => order.forEach((child) => journal.insert(child, list, null)));
  return list;
};

/**
 * Hides one visible element under `root` (keeping its space), as one
 * undoable step. Returns the element, or `null` when nothing is left to hide.
 */
export const hideSomething = (root: Element, journal: DomJournal, random: () => number = Math.random): Element | null => {
  const candidates = [...root.querySelectorAll<HTMLElement>(HIDEABLE_SELECTOR)].filter(
    (element) => notOurs(element) && element.style.visibility !== 'hidden'
  );
  const target = pick(candidates, random);
  if (!target) return null;
  journal.batch(`Hid ${shortSelector(target)}`, () => journal.setStyle(target, 'visibility', 'hidden'));
  return target;
};

/**
 * Mixes up the words of one sentence under `root`, as one undoable step.
 * Returns the changed text, or `null` when no text has two words.
 */
export const scrambleWords = (root: Element, journal: DomJournal, random: () => number = Math.random): Text | null => {
  const candidates = walkText(root).filter((node) => node.data.trim().split(/\s+/).length > 1);
  const target = pick(candidates, random);
  if (!target) return null;
  const leading = target.data.match(/^\s*/)?.[0] ?? '';
  const trailing = target.data.match(/\s*$/)?.[0] ?? '';
  const words = shuffled(target.data.trim().split(/\s+/), random);
  journal.batch(`Scrambled ${labelOf(target)}`, () => journal.setText(target, `${leading}${words.join(' ')}${trailing}`));
  return target;
};
