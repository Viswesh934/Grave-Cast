import { grimoireRites } from 'groove-ui';

/** The Grimoire overview page. */
export const GRIMOIRE_PATH = '/docs/components/grimoire';

/** Rites that have a docs page. Add an id here and a page in `registry.tsx`. */
export const RITE_DOC_IDS = ['medium', 'soul-reader', 'haunted-ink', 'vigil', 'necromancer', 'seance', 'poltergeist', 'crypt'] as const;

export type RiteDocId = (typeof RITE_DOC_IDS)[number];

/** A rite's docs page. */
export const ritePath = (id: string) => `${GRIMOIRE_PATH}/${id}`;

/** Rites with a docs page, in the library's order. */
export const documentedRites = grimoireRites.filter((rite) => (RITE_DOC_IDS as readonly string[]).includes(rite.id));

const AFTER_GRIMOIRE = { title: 'Button', path: '/docs/components/button' };

/** The previous and next pages around a rite, for the links at the bottom. */
export const riteNeighbors = (id: string) => {
  const index = documentedRites.findIndex((rite) => rite.id === id);
  const before = documentedRites[index - 1];
  const after = documentedRites[index + 1];
  return {
    prevPage: before ? { title: before.name, path: ritePath(before.id) } : { title: 'Grimoire', path: GRIMOIRE_PATH },
    nextPage: after ? { title: after.name, path: ritePath(after.id) } : AFTER_GRIMOIRE,
  };
};

/** The page after the overview. */
export const firstRitePage = () =>
  documentedRites[0] ? { title: documentedRites[0].name, path: ritePath(documentedRites[0].id) } : AFTER_GRIMOIRE;
