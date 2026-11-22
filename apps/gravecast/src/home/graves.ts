/**
 * One shape for every grave on the page, whether it came from a link or a
 * repo, so the preview, the stories and the list all read the same thing.
 */
import type { TombstoneWeathering } from 'groove-ui'
import { CHECKED_ON_SERVER, DOMAIN_AGE, NOT_CHECKED_YET, verdictFor, type Grave, type GraveSeverity, type LinkSummary } from '../linkscan/deviceChecks'
import { hostOf, type ServerScan } from '../linkscan/serverScan'
import { groupRepoGraves } from '../repograve/groupGraves'
import { REPO_STANDING_LIMITS } from '../repograve/markerWords'
import { SEVERITIES, type RepoGraveyard } from '../repograve/repoScan'

export type Mode = 'link' | 'dev'

/** One place a grave's finding was found, when a grave gathers several. */
export interface GravePlace {
  /** What it is, when the grave holds findings of different kinds. */
  title?: string
  /** The file and line, or the package and version. */
  where: string
  href?: string
  /** The line it was found on (secrets already hidden). */
  snippet?: string
  /** A short fact about this place, such as the version that fixes a package. */
  note?: string
  links?: { label: string; url: string }[]
}

export interface StoryGrave {
  id: string
  /** The finding's name, carved on the stone. */
  title: string
  /** Severity in words, or a label such as "Missing protection". */
  label: string
  /** What it means, in plain words. */
  detail: string
  /** The exact thing it was read from. */
  evidence: string
  weathering: TombstoneWeathering
  /** Where to see the evidence for yourself, if there is a place. */
  href?: string
  /** The line it was found on (secrets already hidden). */
  snippet?: string
  /** What to do about it. */
  fix?: string
  /** Short facts such as the CWE, the OWASP category and how sure the finding is. */
  tags?: string[]
  /** Advisories and standards to read more. */
  refs?: { label: string; url: string }[]
  /** Carved under the title on the stone, such as the file or "3 places". */
  engraving?: string
  /** Every place, when one grave gathers several findings of a kind. */
  places?: GravePlace[]
}

/** Everything the page shows about one finished scan. */
export interface ScanSummary {
  mode: Mode
  /** What was scanned, as shown to the visitor. */
  subject: string
  /** The one-line verdict. Never "safe". */
  verdict: string
  /** Plain facts about the scan, one per line. */
  facts: string[]
  graves: StoryGrave[]
  notChecked: readonly string[]
  /** A closing note under the not-checked list. */
  note?: string
  /** Open issues and pull requests on GitHub, for dev mode. */
  openIssues?: number
  /** Breakdown of findings by severity for compact badge rendering */
  severityCounts?: Record<string, number>
}

const LINK_WEATHERING: Record<GraveSeverity, TombstoneWeathering> = {
  danger: 'crumbling',
  warning: 'cracked',
  caution: 'aged',
  note: 'pristine',
}

const SEVERITY_WORD: Record<GraveSeverity, string> = {
  danger: 'Serious',
  warning: 'Risky',
  caution: 'Unusual',
  note: 'Note',
}

export interface CheckedLink {
  link: LinkSummary
  graves: Grave[]
  /** What the server found, or null when it couldn't check. */
  server: ServerScan | null
  /** Why the server couldn't check, in plain words. */
  serverProblem: string | null
}

const DAYS_PER_YEAR = 365
const DAYS_PER_MONTH = 30
/** "3 days", "5 months", "12 years". */
const describeAge = (days: number): string => {
  if (days >= DAYS_PER_YEAR) {
    const years = Math.floor(days / DAYS_PER_YEAR)
    return `${years} ${years === 1 ? 'year' : 'years'}`
  }
  if (days >= DAYS_PER_MONTH * 2) return `${Math.floor(days / DAYS_PER_MONTH)} months`
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

/** What the server didn't check: domain age drops off the list once WHOIS has answered for where the link ends. */
const notCheckedAfterServer = (server: ServerScan): readonly string[] =>
  server.domainAgeChecked
    ? NOT_CHECKED_YET.filter((item) => item !== DOMAIN_AGE)
    : NOT_CHECKED_YET.map((item) => (item === DOMAIN_AGE ? `${DOMAIN_AGE} (no WHOIS server gave a date; many registries stopped running WHOIS in 2025)` : item))

export function summariseLink({ link, graves, server, serverProblem }: CheckedLink): ScanSummary {
  const facts: string[] = []
  const renamed = link.displayHost !== link.host ? ` (sent as ${link.host})` : ''
  const finalHost = server ? hostOf(server.finalUrl) : null
  const ends = finalHost && finalHost !== link.host ? ` and ends on ${finalHost}` : ''
  facts.push(`This link opens ${link.displayHost}${renamed}${ends}.`)
  if (server && server.hops.length > 0) {
    facts.push(`It forwards ${server.hops.length} ${server.hops.length === 1 ? 'time' : 'times'} on the way.`)
  }
  // Domain age comes from WHOIS, the 1982 lookup that RDAP replaced: shown as the record's own line.
  for (const record of server?.domainRecords ?? []) {
    facts.push(`WHOIS (${record.server}): ${record.line}. ${record.domain} is ${describeAge(record.ageDays)} old.`)
  }
  if (serverProblem) facts.push(`The server didn\u2019t open it: ${serverProblem}`)
  const severityCounts: Record<string, number> = {}
  for (const g of graves) {
    severityCounts[g.severity] = (severityCounts[g.severity] ?? 0) + 1
  }
  return {
    mode: 'link',
    subject: finalHost ?? link.displayHost,
    verdict: verdictFor(graves),
    facts,
    graves: graves.map((g) => ({
      id: g.id,
      title: g.title,
      label: g.label ?? SEVERITY_WORD[g.severity],
      detail: g.detail,
      evidence: g.evidence,
      weathering: LINK_WEATHERING[g.severity],
    })),
    notChecked: server ? notCheckedAfterServer(server) : [...CHECKED_ON_SERVER, ...NOT_CHECKED_YET],
    note:
      'Missing protections are the site owner\u2019s to fix. They make a site easier to attack, but they don\u2019t show that this link is harmful.',
    severityCounts,
  }
}

const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`

/** Concise verdict headline; specific severity counts are rendered in compact badge pills. */
const repoVerdict = (graveyard: RepoGraveyard): string => {
  if (graveyard.total === 0) return 'No problems found by these checks.'
  return `${plural(graveyard.total, 'finding', 'findings')} discovered.`
}

export function summariseRepo(graveyard: RepoGraveyard): ScanSummary {
  const facts = [
    `Read ${graveyard.filesRead} out of ${plural(graveyard.filesDiscovered, 'file', 'files')} in the repo${
      graveyard.languages.length > 0 ? ` (${graveyard.languages.join(', ')})` : ''
    }.`,
  ]
  if (graveyard.lockfiles.length > 0) {
    facts.push(`Checked ${plural(graveyard.packagesChecked, 'package version', 'package versions')} from ${graveyard.lockfiles.join(', ')} against OSV.dev.`)
  }
  facts.push(`${graveyard.openIssues} open ${graveyard.openIssues === 1 ? 'issue or pull request' : 'issues and pull requests'} on GitHub.`)
  const stones = groupRepoGraves(graveyard)
  if (stones.length < graveyard.graves.length) {
    facts.push(`${plural(graveyard.graves.length, 'finding', 'findings')} gathered into ${plural(stones.length, 'grave', 'graves')}, one for each kind, most serious first.`)
  }
  if (graveyard.truncated) facts.push(`The server sent ${graveyard.graves.length} of ${graveyard.total} findings: every critical and high one, and the rest up to its limit.`)

  // Every check that did not fully run, with its reason, then what the scan never looks at.
  const notChecked = graveyard.checks.filter((c) => c.status !== 'ran').map((c) => `${c.name}: ${c.detail}`)
  if (graveyard.filesSkipped > 0) notChecked.push(`${plural(graveyard.filesSkipped, 'file', 'files')} left out by the size or count limits`)
  const severityCounts: Record<string, number> = {}
  for (const s of SEVERITIES) {
    if (graveyard.bySeverity[s] > 0) {
      severityCounts[s] = graveyard.bySeverity[s]
    }
  }

  return {
    mode: 'dev',
    subject: graveyard.fullName,
    verdict: repoVerdict(graveyard),
    facts,
    graves: stones,
    notChecked: [...notChecked, ...REPO_STANDING_LIMITS],
    note: 'Each grave is found by reading the files. Check it in the code before you change anything.',
    openIssues: graveyard.openIssues,
    severityCounts,
  }
}