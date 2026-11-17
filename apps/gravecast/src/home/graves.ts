/**
 * One shape for every grave on the page, whether it came from a link or a
 * repo, so the preview, the stories and the list all read the same thing.
 */
import type { TombstoneWeathering } from 'groove-ui'
import { CHECKED_ON_SERVER, DOMAIN_AGE, NOT_CHECKED_YET, verdictFor, type Grave, type GraveSeverity, type LinkSummary } from '../linkscan/deviceChecks'
import { hostOf, type ServerScan } from '../linkscan/serverScan'
import { MARKER_MEANING, MARKER_WEATHERING, REPO_NOT_CHECKED } from '../repograve/markerWords'
import { lineUrl, type RepoGraveyard } from '../repograve/repoScan'

export type Mode = 'link' | 'dev'

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
  }
}

export function summariseRepo(graveyard: RepoGraveyard): ScanSummary {
  const count = graveyard.markerCount
  const facts = [
    `Read ${graveyard.filesRead} source ${graveyard.filesRead === 1 ? 'file' : 'files'} out of ${graveyard.filesDiscovered} in the repo${
      graveyard.languages.length > 0 ? ` (${graveyard.languages.join(', ')})` : ''
    }.`,
    `${graveyard.openIssues} open ${graveyard.openIssues === 1 ? 'issue or pull request' : 'issues and pull requests'} on GitHub.`,
  ]
  if (graveyard.truncated) facts.push(`Showing the first ${graveyard.graves.length}, most serious first.`)
  return {
    mode: 'dev',
    subject: graveyard.fullName,
    verdict: count === 0 ? 'No markers found in the code.' : `${count} ${count === 1 ? 'grave' : 'graves'} found.`,
    facts,
    graves: graveyard.graves.map((g) => ({
      id: g.id,
      title: g.kind,
      label: MARKER_MEANING[g.kind],
      detail: g.note || 'No note was left with it.',
      evidence: `${g.path}:${g.line}`,
      weathering: MARKER_WEATHERING[g.kind],
      href: lineUrl(graveyard, g),
    })),
    notChecked: [...REPO_NOT_CHECKED, 'Files in other languages, and folders such as node_modules and build output'],
    openIssues: graveyard.openIssues,
  }
}