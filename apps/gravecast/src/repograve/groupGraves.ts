/**
 * Gathers a repo scan's findings into graves, one per kind of finding, so the
 * yard holds a handful of stones instead of one per line (docs/REPO_SCAN_DESIGN.md §11).
 */
import type { GravePlace, StoryGrave } from '../home/graves'
import { CATEGORY_WORD, CONFIDENCE_WORD, SEVERITY_WEATHERING, SEVERITY_WORD, fileName } from './markerWords'
import { lineUrl, SEVERITIES, type RepoGrave, type RepoGraveyard, type RepoSeverity } from './repoScan'

/** The most graves a repo yard shows. Past this, the less serious kinds share the last grave. */
export const MAX_REPO_GRAVES = 10
/** Advisory links shown under each vulnerable package. */
const ADVISORY_LINKS = 3

const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`

/** Which grave a finding belongs to. The Python and JavaScript forms of a rule share one. */
const kindOf = (grave: RepoGrave): string => grave.rule.replace(/^(py|js)\./, 'code.')

const worstOf = (graves: RepoGrave[]): RepoSeverity => SEVERITIES.find((s) => graves.some((g) => g.severity === s)) ?? 'info'

const where = (grave: RepoGrave): string => (grave.path ? `${grave.path}${grave.line ? `:${grave.line}` : ''}` : 'The whole repo')

/** CWE and OWASP links, as opposed to a package's advisory links. */
const isStandard = (label: string): boolean => label.startsWith('CWE-') || label.includes(':2025')

/** One place a finding was found, as its grave's card lists it. */
const placeOf = (graveyard: RepoGraveyard, grave: RepoGrave, withTitle: boolean): GravePlace => {
  const p = grave.package
  if (p) {
    return {
      where: `${p.name} ${p.version}${p.dev ? ' (development only)' : ''}`,
      href: lineUrl(graveyard, grave),
      note: `${SEVERITY_WORD[grave.severity]}. ${p.fixedIn ? `Fixed in ${p.fixedIn}.` : 'No fixed version yet.'}`,
      links: grave.references.filter((r) => !isStandard(r.label)).slice(0, ADVISORY_LINKS),
    }
  }
  return {
    title: withTitle ? `${grave.title} (${SEVERITY_WORD[grave.severity].toLowerCase()})` : undefined,
    where: where(grave),
    href: lineUrl(graveyard, grave),
    snippet: grave.snippet ?? undefined,
    note: grave.rule === 'note.marker' ? `${grave.title}: ${grave.detail}` : undefined,
  }
}

const tagsOf = (grave: RepoGrave): string[] =>
  [grave.cwe, grave.owasp, grave.category === 'code-note' ? null : `${CONFIDENCE_WORD[grave.confidence]} finding`].filter((t): t is string => t !== null)

/** A grave for one finding: its own file, line, snippet and fix. */
const single = (graveyard: RepoGraveyard, g: RepoGrave): StoryGrave => {
  const tags = tagsOf(g)
  if (g.package) tags.unshift(`${g.package.name} ${g.package.version}${g.package.dev ? ' (development only)' : ''}`)
  return {
    id: g.id,
    title: g.title,
    label: `${SEVERITY_WORD[g.severity]} \u00b7 ${CATEGORY_WORD[g.category]}`,
    detail: g.detail,
    evidence: where(g),
    engraving: g.path ? fileName(g.path) : undefined,
    weathering: SEVERITY_WEATHERING[g.severity],
    href: lineUrl(graveyard, g),
    snippet: g.snippet ?? undefined,
    fix: g.fix,
    tags,
    refs: g.references,
  }
}

const severityCounts = (graves: RepoGrave[]): string =>
  SEVERITIES.filter((s) => graves.some((g) => g.severity === s))
    .map((s) => `${graves.filter((g) => g.severity === s).length} ${SEVERITY_WORD[s].toLowerCase()}`)
    .join(', ')

/** A grave for several findings of one kind, with every place listed on its card. */
const group = (graveyard: RepoGraveyard, kind: string, graves: RepoGrave[]): StoryGrave => {
  const first = graves[0]
  const worst = worstOf(graves)
  const count = graves.length
  const base = {
    id: `group:${kind}`,
    label: `${SEVERITY_WORD[worst]} \u00b7 ${CATEGORY_WORD[first.category]}`,
    weathering: SEVERITY_WEATHERING[worst],
    places: graves.map((g) => placeOf(graveyard, g, false)),
  }
  if (kind === 'dep.vulnerable') {
    return {
      ...base,
      title: 'Vulnerable dependencies',
      engraving: plural(count, 'package', 'packages'),
      evidence: plural(count, 'package', 'packages'),
      detail: `${plural(count, 'package version in this repo has', 'package versions in this repo have')} published security advisories (${severityCounts(graves)}). Each one is listed below with the version that fixes it.`,
      fix: 'Upgrade each package to the version listed for it, then update the lockfile. Start with the most serious.',
      tags: [first.cwe, first.owasp].filter((t): t is string => t !== null),
      refs: first.references.filter((r) => isStandard(r.label)),
    }
  }
  if (kind === 'note.marker') {
    return {
      ...base,
      title: 'Code notes',
      engraving: plural(count, 'note', 'notes'),
      evidence: plural(count, 'note', 'notes'),
      detail: `${plural(count, 'TODO, FIXME, HACK or XXX note was', 'TODO, FIXME, HACK and XXX notes were')} left in the code's comments.`,
      fix: first.fix,
    }
  }
  return {
    ...base,
    title: first.title,
    engraving: plural(count, 'place', 'places'),
    evidence: plural(count, 'place', 'places'),
    detail: first.detail,
    fix: first.fix,
    tags: tagsOf(first),
    refs: first.references,
  }
}

/** The less serious kinds past the ninth grave, sharing the last one. */
const others = (graveyard: RepoGraveyard, graves: RepoGrave[], kinds: number): StoryGrave => {
  const worst = worstOf(graves)
  return {
    id: 'group:other',
    title: 'Other findings',
    label: `${SEVERITY_WORD[worst]} \u00b7 ${plural(kinds, 'kind', 'kinds')}`,
    engraving: plural(graves.length, 'finding', 'findings'),
    evidence: plural(graves.length, 'finding', 'findings'),
    detail: `${plural(graves.length, 'less serious finding', 'less serious findings')} of ${plural(kinds, 'kind', 'different kinds')}, gathered in one grave so the yard stays easy to walk. Each one is listed below with what it is.`,
    weathering: SEVERITY_WEATHERING[worst],
    places: graves.map((g) => placeOf(graveyard, g, true)),
  }
}

/** The repo's graves: one per kind of finding, most serious first, at most MAX_REPO_GRAVES. */
export function groupRepoGraves(graveyard: RepoGraveyard): StoryGrave[] {
  const kinds = new Map<string, RepoGrave[]>()
  for (const grave of graveyard.graves) {
    const kind = kindOf(grave)
    const list = kinds.get(kind)
    if (list) list.push(grave)
    else kinds.set(kind, [grave])
  }
  // Worst severity first, then the kind with more findings.
  const ordered = [...kinds.entries()].sort(
    ([, a], [, b]) => SEVERITIES.indexOf(worstOf(a)) - SEVERITIES.indexOf(worstOf(b)) || b.length - a.length,
  )
  const asGrave = ([kind, graves]: [string, RepoGrave[]]): StoryGrave =>
    graves.length === 1 ? single(graveyard, graves[0]) : group(graveyard, kind, graves)
  if (ordered.length <= MAX_REPO_GRAVES) return ordered.map(asGrave)
  const kept = ordered.slice(0, MAX_REPO_GRAVES - 1)
  const rest = ordered.slice(MAX_REPO_GRAVES - 1)
  return [...kept.map(asGrave), others(graveyard, rest.flatMap(([, graves]) => graves), rest.length)]
}
