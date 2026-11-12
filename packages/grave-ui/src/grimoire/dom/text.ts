/**
 * Walking and searching the text on a page.
 * @module grimoire/dom/text
 */

import { isGrimoireNode } from './marker';

/** Elements whose text is not shown as page text. */
const SKIPPED_TEXT_PARENTS = new Set(['script', 'style', 'noscript', 'template', 'textarea', 'iframe', 'object', 'title']);

/**
 * Options for {@link walkText}.
 */
export interface WalkTextOptions {
  /** Include text nodes that are only spaces and line breaks. @default false */
  includeWhitespace?: boolean;
}

/**
 * Every text node under `root` that a person could read: not inside
 * scripts, styles, or form fields, and not part of Grimoire's overlays.
 *
 * @example
 * ```ts
 * const words = walkText(document.body).reduce((sum, node) => sum + node.data.split(/\s+/).length, 0);
 * ```
 */
export const walkText = (root: Node, options: WalkTextOptions = {}): Text[] => {
  const { includeWhitespace = false } = options;
  const document = root.ownerDocument ?? (root as Document);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || SKIPPED_TEXT_PARENTS.has(parent.localName) || isGrimoireNode(node)) return NodeFilter.FILTER_REJECT;
      if (!includeWhitespace && (node.textContent ?? '').trim() === '') return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
  return nodes;
};

/**
 * One match from {@link findText}.
 */
export interface TextMatch {
  node: Text;
  /** Offset of the first matched character in `node.data`. */
  start: number;
  /** Offset just after the last matched character. */
  end: number;
}

/**
 * Options for {@link findText}.
 */
export interface FindTextOptions {
  /** Match upper and lower case exactly. @default false */
  caseSensitive?: boolean;
  /** Only match whole words. @default false */
  wholeWord?: boolean;
  /** Stop after this many matches. @default FIND_TEXT_LIMIT */
  limit?: number;
}

/** Default limit on matches, to stay quick on large pages. */
export const FIND_TEXT_LIMIT = 500;

/** Letters, digits, and underscores in any language: what counts as part of a word. */
const WORD_CHARACTER = /[\p{L}\p{N}_]/u;

/**
 * Finds text on the page. Each match lies inside one text node, so text
 * split across elements (`<b>gr</b>ave`) is not found as one word.
 *
 * Turn a match into a `Range` with {@link matchToRange} to highlight, scroll
 * to, or replace it.
 *
 * @example
 * ```ts
 * const matches = findText(document.body, 'ghost', { wholeWord: true });
 * ```
 */
export const findText = (root: Node, query: string, options: FindTextOptions = {}): TextMatch[] => {
  const { caseSensitive = false, wholeWord = false, limit = FIND_TEXT_LIMIT } = options;
  if (query === '') return [];
  const needle = caseSensitive ? query : query.toLowerCase();
  const matches: TextMatch[] = [];

  for (const node of walkText(root)) {
    const haystack = caseSensitive ? node.data : node.data.toLowerCase();
    let from = 0;
    for (let index = haystack.indexOf(needle, from); index !== -1; index = haystack.indexOf(needle, from)) {
      const end = index + needle.length;
      from = end;
      if (wholeWord) {
        const before = index > 0 ? node.data.charAt(index - 1) : '';
        const after = node.data.charAt(end);
        if (WORD_CHARACTER.test(before) || WORD_CHARACTER.test(after)) continue;
      }
      matches.push({ node, start: index, end });
      if (matches.length >= limit) return matches;
    }
  }
  return matches;
};

/** A `Range` covering a match, for highlighting, measuring, or replacing it. */
export const matchToRange = (match: TextMatch): Range => {
  const range = match.node.ownerDocument.createRange();
  range.setStart(match.node, match.start);
  range.setEnd(match.node, match.end);
  return range;
};
