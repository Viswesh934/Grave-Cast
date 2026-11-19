/** How each marker kind is shown: its meaning in words and the weathering of its stone. */
import type { TombstoneWeathering } from 'groove-ui'
import type { MarkerKind } from './repoScan'

/** What each marker says, by the usual convention among developers. */
export const MARKER_MEANING: Record<MarkerKind, string> = {
  FIXME: 'Known to be broken',
  XXX: 'Flagged as wrong or risky',
  HACK: 'A workaround',
  TODO: 'Unfinished work',
}

/** The more a marker admits is wrong, the more weathered its stone. */
export const MARKER_WEATHERING: Record<MarkerKind, TombstoneWeathering> = {
  FIXME: 'cracked',
  XXX: 'cracked',
  HACK: 'aged',
  TODO: 'pristine',
}

/** What the repo graveyard doesn't look for yet. */
export const REPO_NOT_CHECKED: readonly string[] = [
  'Code that is never used',
  'Dependencies with known vulnerabilities',
  'Passwords or keys left in the code',
  'How old each marker is, from the git history',
]

/** The last part of a path, for labels with little room. */
export const fileName = (path: string): string => path.slice(path.lastIndexOf('/') + 1)

