/**
 * Asks Gravecast's server to scan a public GitHub repo for security problems
 * and code notes, and reads its answer (schema version 2, docs/REPO_SCAN_DESIGN.md §4).
 */
import { apiUrl, postJson } from '../shared/api'

export type RepoSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type RepoConfidence = 'confirmed' | 'likely' | 'possible'
export type RepoCategory =
  | 'vulnerable-dependency'
  | 'secret'
  | 'injection'
  | 'access-control'
  | 'crypto'
  | 'authentication'
  | 'misconfiguration'
  | 'supply-chain'
  | 'exposure'
  | 'code-note'

export interface RepoReference {
  label: string
  url: string
}

export interface RepoPackage {
  ecosystem: string
  name: string
  version: string
  fixedIn: string | null
  dev: boolean
}

export interface RepoGrave {
  id: string
  /** The rule that raised it, such as 'py.sql-injection'. */
  rule: string
  category: RepoCategory
  severity: RepoSeverity
  confidence: RepoConfidence
  title: string
  detail: string
  fix: string
  path: string | null
  line: number | null
  /** The line it was found on. Secrets in it are already hidden by the server. */
  snippet: string | null
  owasp: string | null
  cwe: string | null
  references: RepoReference[]
  package: RepoPackage | null
}

export interface RepoCheck {
  id: 'dependencies' | 'secrets' | 'code' | 'config' | 'project' | 'markers'
  name: string
  status: 'ran' | 'partial' | 'skipped' | 'failed'
  detail: string
}

export interface RepoGraveyard {
  fullName: string
  commitSha: string
  /** Open issues and pull requests on GitHub (GitHub counts both together). */
  openIssues: number
  graves: RepoGrave[]
  /** Every finding, including ones past the cap. */
  total: number
  bySeverity: Record<RepoSeverity, number>
  checks: RepoCheck[]
  filesRead: number
  filesDiscovered: number
  filesSkipped: number
  languages: string[]
  lockfiles: string[]
  packagesChecked: number
  markerCount: number
  /** More findings exist than were returned. */
  truncated: boolean
}

export type RepoScanResult = { ok: true; graveyard: RepoGraveyard } | { ok: false; reason: string; code?: string }

export const SEVERITIES: readonly RepoSeverity[] = ['critical', 'high', 'medium', 'low', 'info']
const CONFIDENCES: readonly RepoConfidence[] = ['confirmed', 'likely', 'possible']
const CATEGORIES: readonly RepoCategory[] = [
  'vulnerable-dependency',
  'secret',
  'injection',
  'access-control',
  'crypto',
  'authentication',
  'misconfiguration',
  'supply-chain',
  'exposure',
  'code-note',
]
const CHECK_IDS: readonly RepoCheck['id'][] = ['dependencies', 'secrets', 'code', 'config', 'project', 'markers']
const CHECK_STATUSES: readonly RepoCheck['status'][] = ['ran', 'partial', 'skipped', 'failed']
const OWNER_REPO = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/

export type RepoInput = { ok: true; url: string } | { ok: false; reason: string }

/**
 * Reads `owner/name` or a github.com link. Catches the plain mistakes here, so
 * the diary only opens for a scan that can start; the server checks the rest.
 */
export const checkRepoInput = (input: string): RepoInput => {
  const text = input.trim().replace(/\/+$/, '')
  if (text === '') return { ok: false, reason: 'Type a repo, such as owner/name.' }
  if (OWNER_REPO.test(text)) return { ok: true, url: `https://github.com/${text}` }
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return { ok: false, reason: 'Type the repo as owner/name, or paste its github.com link.' }
  }
  if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
    return { ok: false, reason: 'Only public repos on github.com can be read here.' }
  }
  return { ok: true, url: url.href }
}

type Raw = Record<string, unknown>
const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null
const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const stringOrNull = (v: unknown): string | null => (isString(v) ? v : null)
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => list.includes(v as T)
/** Only https links are kept, so a reference can never run script when clicked. */
const isWebLink = (v: unknown): v is string => isString(v) && /^https:\/\//i.test(v)

const readReference = (value: unknown): RepoReference | null =>
  isObject(value) && isString(value.label) && isWebLink(value.url) ? { label: value.label, url: value.url } : null

const readPackage = (value: unknown): RepoPackage | null => {
  if (!isObject(value) || !isString(value.ecosystem) || !isString(value.name) || !isString(value.version)) return null
  return { ecosystem: value.ecosystem, name: value.name, version: value.version, fixedIn: stringOrNull(value.fixedIn), dev: value.dev === true }
}

const readGrave = (value: unknown): RepoGrave | null => {
  if (!isObject(value)) return null
  const g = value
  if (!isString(g.id) || !isString(g.rule) || !isString(g.title) || !isString(g.detail) || !isString(g.fix)) return null
  if (!oneOf(CATEGORIES, g.category) || !oneOf(SEVERITIES, g.severity) || !oneOf(CONFIDENCES, g.confidence)) return null
  return {
    id: g.id,
    rule: g.rule,
    category: g.category,
    severity: g.severity,
    confidence: g.confidence,
    title: g.title,
    detail: g.detail,
    fix: g.fix,
    path: stringOrNull(g.path),
    line: isNumber(g.line) ? g.line : null,
    snippet: stringOrNull(g.snippet),
    owasp: stringOrNull(g.owasp),
    cwe: stringOrNull(g.cwe),
    references: Array.isArray(g.references) ? g.references.map(readReference).filter((r): r is RepoReference => r !== null) : [],
    package: readPackage(g.package),
  }
}

const readCheck = (value: unknown): RepoCheck | null => {
  if (!isObject(value) || !oneOf(CHECK_IDS, value.id) || !oneOf(CHECK_STATUSES, value.status)) return null
  if (!isString(value.name) || !isString(value.detail)) return null
  return { id: value.id, name: value.name, status: value.status, detail: value.detail }
}

export const readGraveyard = (body: unknown): RepoGraveyard | null => {
  if (!isObject(body) || body.schemaVersion !== 2) return null
  const { repository: repo, stats, summary } = body
  if (!isObject(repo) || !isObject(stats) || !isObject(summary) || !Array.isArray(body.graves)) return null
  if (!isString(repo.fullName) || !isString(repo.commitSha)) return null
  if (!isNumber(stats.filesRead) || !isNumber(stats.filesDiscovered) || !isNumber(summary.total)) return null
  const counts = isObject(summary.bySeverity) ? summary.bySeverity : {}
  const bySeverity = Object.fromEntries(SEVERITIES.map((s) => [s, isNumber(counts[s]) ? counts[s] : 0])) as Record<RepoSeverity, number>
  return {
    fullName: repo.fullName,
    commitSha: repo.commitSha,
    openIssues: isNumber(repo.openIssues) ? repo.openIssues : 0,
    graves: body.graves.map(readGrave).filter((g): g is RepoGrave => g !== null),
    total: summary.total,
    bySeverity,
    checks: Array.isArray(body.checks) ? body.checks.map(readCheck).filter((c): c is RepoCheck => c !== null) : [],
    filesRead: stats.filesRead,
    filesDiscovered: stats.filesDiscovered,
    filesSkipped: isNumber(stats.filesSkipped) ? stats.filesSkipped : 0,
    languages: Array.isArray(stats.languages) ? stats.languages.filter(isString) : [],
    lockfiles: Array.isArray(stats.lockfiles) ? stats.lockfiles.filter(isString) : [],
    packagesChecked: isNumber(stats.packagesChecked) ? stats.packagesChecked : 0,
    markerCount: isNumber(stats.markerCount) ? stats.markerCount : 0,
    truncated: body.truncated === true,
  }
}

/** Never throws: failures come back as a reason in plain words. */
export async function scanRepo(url: string, signal?: AbortSignal): Promise<RepoScanResult> {
  const result = await postJson(apiUrl('/api/repositories/graveyard'), { url }, signal)
  if (!result.ok) return result
  const graveyard = readGraveyard(result.body)
  return graveyard ? { ok: true, graveyard } : { ok: false, reason: 'The server sent an answer that could not be read.' }
}

/** A link to the file (and line) on GitHub, pinned to the commit that was read, or undefined when the grave has no file. */
export const lineUrl = (graveyard: RepoGraveyard, grave: RepoGrave): string | undefined => {
  if (!grave.path) return undefined
  const path = grave.path.split('/').map(encodeURIComponent).join('/')
  return `https://github.com/${graveyard.fullName}/blob/${graveyard.commitSha}/${path}${grave.line ? `#L${grave.line}` : ''}`
}
