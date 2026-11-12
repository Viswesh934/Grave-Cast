/**
 * Changing the page in a way that can always be undone.
 * @module grimoire/dom/journal
 */

/** Undo steps kept by default. Older steps are forgotten and can no longer be undone. */
export const JOURNAL_MAX_STEPS = 200;

/** The kind of change a journal step made. */
export type JournalChange = 'text' | 'attribute' | 'style' | 'remove' | 'insert';

/**
 * One undoable step: a single change, or a batch of them.
 */
export interface JournalStep {
  /** What the step was, for showing in an undo list. */
  label: string;
  /** The kinds of change in it. */
  changes: JournalChange[];
}

/**
 * Options for {@link createDomJournal}.
 */
export interface DomJournalOptions {
  /** Undo steps to keep. @default JOURNAL_MAX_STEPS */
  maxSteps?: number;
}

/**
 * A record of page edits, from {@link createDomJournal}.
 */
export interface DomJournal {
  /** Replaces the text of a text node, or all content of an element with text. */
  setText: (target: CharacterData | Element, text: string) => void;
  /** Sets an attribute, or removes it when `value` is `null`. */
  setAttribute: (element: Element, name: string, value: string | null) => void;
  /** Sets an inline style property (`color`, `--my-var`), or removes it when `value` is `null`. */
  setStyle: (element: Element, property: string, value: string | null, priority?: 'important' | '') => void;
  /** Takes a node out of the page. Undo puts it back where it was. */
  remove: (node: ChildNode) => void;
  /** Puts a node into `parent`, before `before` (or at the end). */
  insert: (node: Node, parent: Node, before?: Node | null) => void;
  /**
   * Groups several changes into one undo step. If `run` throws, the changes
   * it made are undone and the error is thrown again.
   */
  batch: (label: string, run: () => void) => void;
  /** Undoes the latest step. Returns `false` when there is nothing to undo. */
  undo: () => boolean;
  /** Undoes every step, newest first, leaving the page as it was. Returns how many were undone. */
  undoAll: () => number;
  /** Forgets every step without undoing them. The changes stay. */
  clear: () => void;
  /** The steps that can be undone, oldest first. */
  readonly steps: readonly JournalStep[];
  /** Calls `listener` whenever steps are added or undone. Returns an unsubscribe function. */
  subscribe: (listener: () => void) => () => void;
}

interface Recorded {
  label: string;
  changes: JournalChange[];
  undos: (() => void)[];
}

/** Inline styles live on HTML and SVG elements; this reaches them for any element. */
const styleOf = (element: Element): CSSStyleDeclaration | null =>
  (element as Element & { style?: CSSStyleDeclaration }).style ?? null;

/**
 * Creates a journal that changes the page and remembers how to change it
 * back. Possession, find-and-replace, and live style edits use it, so every
 * trick can be reverted, all at once if needed.
 *
 * - Undo restores the original nodes and values, not copies.
 * - Steps beyond `maxSteps` are forgotten (their changes stay).
 * - Only what goes through the journal can be undone. If the app changes
 *   the same element afterwards, undo puts back what the journal saw.
 *
 * @example
 * ```ts
 * const journal = createDomJournal();
 * journal.batch('Possess the heading', () => {
 *   journal.setText(heading, 'It is behind you');
 *   journal.setStyle(heading, 'color', grimoireAccents.blood);
 * });
 * journal.undo(); // the heading is back
 * ```
 */
export const createDomJournal = (options: DomJournalOptions = {}): DomJournal => {
  const { maxSteps = JOURNAL_MAX_STEPS } = options;
  let steps: Recorded[] = [];
  let open: Recorded | null = null;
  const listeners = new Set<() => void>();
  let snapshot: readonly JournalStep[] = [];

  const notify = () => {
    snapshot = steps.map(({ label, changes }) => ({ label, changes: [...changes] }));
    listeners.forEach((listener) => listener());
  };

  const commit = (recorded: Recorded) => {
    if (recorded.undos.length === 0) return;
    steps.push(recorded);
    if (steps.length > maxSteps) steps = steps.slice(steps.length - maxSteps);
    notify();
  };

  /** Adds one change: to the open batch, or as its own step. */
  const push = (change: JournalChange, label: string, undo: () => void) => {
    if (open) {
      open.changes.push(change);
      open.undos.push(undo);
    } else {
      commit({ label, changes: [change], undos: [undo] });
    }
  };

  const runUndos = (recorded: Recorded) => {
    for (let index = recorded.undos.length - 1; index >= 0; index -= 1) recorded.undos[index]();
  };

  const journal: DomJournal = {
    setText(target, text) {
      if (target.nodeType === Node.ELEMENT_NODE) {
        const element = target as Element;
        const previous = [...element.childNodes];
        element.textContent = text;
        push('text', 'Change text', () => element.replaceChildren(...previous));
      } else {
        const node = target as CharacterData;
        const previous = node.data;
        node.data = text;
        push('text', 'Change text', () => {
          node.data = previous;
        });
      }
    },

    setAttribute(element, name, value) {
      const previous = element.getAttribute(name);
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
      push('attribute', `Change ${name}`, () => {
        if (previous === null) element.removeAttribute(name);
        else element.setAttribute(name, previous);
      });
    },

    setStyle(element, property, value, priority = '') {
      const style = styleOf(element);
      if (!style) return;
      const previous = style.getPropertyValue(property);
      const previousPriority = style.getPropertyPriority(property);
      const hadStyleAttribute = element.hasAttribute('style');
      if (value === null) style.removeProperty(property);
      else style.setProperty(property, value, priority);
      push('style', `Change ${property}`, () => {
        if (previous === '') style.removeProperty(property);
        else style.setProperty(property, previous, previousPriority);
        // Leave no empty style="" behind on elements that never had one.
        if (!hadStyleAttribute && style.length === 0) element.removeAttribute('style');
      });
    },

    remove(node) {
      const parent = node.parentNode;
      if (!parent) return;
      const next = node.nextSibling;
      parent.removeChild(node);
      push('remove', 'Remove', () => {
        parent.insertBefore(node, next && next.parentNode === parent ? next : null);
      });
    },

    insert(node, parent, before = null) {
      const previousParent = node.parentNode;
      const previousNext = node.nextSibling;
      parent.insertBefore(node, before);
      push('insert', 'Insert', () => {
        if (previousParent) previousParent.insertBefore(node, previousNext && previousNext.parentNode === previousParent ? previousNext : null);
        // Read fresh: the node has a parent now even though it had none before.
        else (node.parentNode as Node | null)?.removeChild(node);
      });
    },

    batch(label, run) {
      if (open) {
        // Nested batches join the outer one.
        run();
        return;
      }
      const recorded: Recorded = { label, changes: [], undos: [] };
      open = recorded;
      try {
        run();
      } catch (error) {
        open = null;
        runUndos(recorded);
        throw error;
      }
      open = null;
      commit(recorded);
    },

    undo() {
      const last = steps.pop();
      if (!last) return false;
      runUndos(last);
      notify();
      return true;
    },

    undoAll() {
      const count = steps.length;
      if (count === 0) return 0;
      for (let index = steps.length - 1; index >= 0; index -= 1) runUndos(steps[index]);
      steps = [];
      notify();
      return count;
    },

    clear() {
      if (steps.length === 0) return;
      steps = [];
      notify();
    },

    get steps() {
      return snapshot;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return journal;
};
