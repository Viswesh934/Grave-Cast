/**
 * The Medium: sees through any element.
 * @module grimoire/rites/medium
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';

/** What the Medium needs: finding elements under the pointer and reading their styles. */
export const mediumCapability = defineCapability({
  id: 'medium',
  label: 'Element inspection',
  detect: () => typeof document.elementsFromPoint === 'function' && typeof getComputedStyle === 'function',
});

export const mediumRite = defineRite({
  id: 'medium',
  name: 'Medium',
  tagline: 'Sees through any element: its box, its colors, and whether its words can be read.',
  sigil: 'eye',
  accent: 'witchfire',
  family: 'seeing',
  support: { chromium: 'full', firefox: 'full', safari: 'full' },
  capability: mediumCapability,
});
