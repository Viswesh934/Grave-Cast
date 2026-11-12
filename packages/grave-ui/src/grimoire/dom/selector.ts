/**
 * Short, readable CSS selectors for elements.
 * @module grimoire/dom/selector
 */

/** Most classes shown in a short selector. */
export const SELECTOR_MAX_CLASSES = 2;

/** Most ancestors a selector path climbs before it stops. */
export const SELECTOR_MAX_DEPTH = 5;

const CODE_POINT_RADIX = 16;
const NULL_CODE_POINT = 0x0000;
const REPLACEMENT_CHARACTER = '\uFFFD';
const DELETE_CODE_POINT = 0x007f;
const CONTROL_RANGE_END = 0x001f;
const HYPHEN_CODE_POINT = 0x002d;

const isDigit = (code: number) => code >= 0x0030 && code <= 0x0039;

/**
 * Escapes text for use in a CSS selector, like `CSS.escape`. Uses the
 * browser's own when it has one.
 */
export const cssEscape = (value: string): string => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);

  // The CSSOM "serialize an identifier" algorithm.
  let result = '';
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    const char = value.charAt(index);
    if (code === NULL_CODE_POINT) result += REPLACEMENT_CHARACTER;
    else if (
      (code >= 1 && code <= CONTROL_RANGE_END) ||
      code === DELETE_CODE_POINT ||
      (index === 0 && isDigit(code)) ||
      (index === 1 && isDigit(code) && value.charCodeAt(0) === HYPHEN_CODE_POINT)
    ) {
      result += `\\${code.toString(CODE_POINT_RADIX)} `;
    } else if (index === 0 && value.length === 1 && code === HYPHEN_CODE_POINT) result += `\\${char}`;
    else if (/[a-zA-Z0-9_-]/.test(char) || code >= 0x0080) result += char;
    else result += `\\${char}`;
  }
  return result;
};

/** The element's tag in lower case, as written in selectors. */
const tagOf = (element: Element): string => element.localName || element.tagName.toLowerCase();

/** Whether an id is used by exactly one element in the document. */
const isUniqueId = (element: Element): boolean => {
  const { id } = element;
  if (!id) return false;
  try {
    return element.ownerDocument.querySelectorAll(`#${cssEscape(id)}`).length === 1;
  } catch {
    return false;
  }
};

/**
 * A short label for an element, for showing people: `button#save`,
 * `div.card.is-open`, or just `p`. Not guaranteed to be unique; use
 * {@link cssPath} for that.
 */
export const shortSelector = (element: Element): string => {
  const tag = tagOf(element);
  if (element.id) return `${tag}#${cssEscape(element.id)}`;
  const classes = [...element.classList].slice(0, SELECTOR_MAX_CLASSES).map((name) => `.${cssEscape(name)}`);
  return `${tag}${classes.join('')}`;
};

/** One step of a path: a unique id, or the tag plus position among same-tag siblings. */
const stepFor = (element: Element): { step: string; anchored: boolean } => {
  if (isUniqueId(element)) return { step: `#${cssEscape(element.id)}`, anchored: true };
  const tag = tagOf(element);
  const parent = element.parentElement;
  if (!parent) return { step: tag, anchored: false };
  const sameTag = [...parent.children].filter((sibling) => sibling.localName === element.localName);
  return { step: sameTag.length > 1 ? `${tag}:nth-of-type(${sameTag.indexOf(element) + 1})` : tag, anchored: false };
};

/**
 * A selector that finds this element again, as short as it can be:
 * `#save`, `main > section:nth-of-type(2) > h2`. It climbs at most
 * `maxDepth` ancestors, stopping early at a unique id or once the path
 * matches only this element.
 *
 * @example
 * ```ts
 * const selector = cssPath(element);
 * document.querySelector(selector) === element; // usually true
 * ```
 */
export const cssPath = (element: Element, maxDepth: number = SELECTOR_MAX_DEPTH): string => {
  const steps: string[] = [];
  let current: Element | null = element;
  for (let depth = 0; current && depth < maxDepth; depth += 1) {
    const { step, anchored } = stepFor(current);
    steps.unshift(step);
    const selector = steps.join(' > ');
    if (anchored) return selector;
    try {
      if (element.ownerDocument.querySelectorAll(selector).length === 1) return selector;
    } catch {
      // A step the browser cannot read: keep climbing.
    }
    current = current.parentElement;
  }
  return steps.join(' > ');
};
