/**
 * Asks Gravecast's server to read a public GitHub repo and return its marker
 * comments (TODO, FIXME, HACK, XXX) as graves.
 */
import { apiUrl, postJson } from '../site/api'

export type MarkerKind = 'FIXME' | 'XXX' | 'HACK' | 'TODO'

export interface RepoGrave {
  id: string
  kind: MarkerKind
  path: string
  line: number
  /** The comment after the marker. May be empty. */
  note: string
}

export interface RepoGraveyard {
  fullName: string
  commitSha: string
  graves: RepoGrave[]
  filesRead: number
  filesDiscovered: number
  markerCount: number
  languages: string[]
  /** More markers exist than were returned. */
  truncated: boolean
}

export type RepoScanResult = { ok: true; graveyard: RepoGraveyard } | { ok: false; reason: string; code?: string }

const KINDS: readonly MarkerKind[] = ['FIXME', 'XXX', 'HACK', 'TODO']
const OWNER_REPO = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/

/**
 * Turns `owner/name` into a github.com link and leaves links as they are; the
 * server does the full check. Returns null for an empty field.
 */
export const toRepoUrl = (input: string): string | null => {
  const text = input.trim().replace(/\/+$/, '')
  if (text === '') return null
  return OWNER_REPO.test(text) ? `https://github.com/${text}` : text
}

const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

const readGrave = (value: unknown): RepoGrave | null => {
  if (typeof value !== 'object' || value === null) return null
  const g = value as Record<string, unknown>
  if (!isString(g.id) || !isString(g.path) || !isString(g.note) || !isNumber(g.line)) return null
  if (!KINDS.includes(g.kind as MarkerKind)) return null
  return { id: g.id, kind: g.kind as MarkerKind, path: g.path, line: g.line, note: g.note }
}

const readGraveyard = (body: unknown): RepoGraveyard | null => {
  if (typeof body !== 'object' || body === null) return null
  const b = body as { repository?: Record<string, unknown>; graves?: unknown; stats?: Record<string, unknown>; truncated?: unknown }
  const repo = b.repository
  const stats = b.stats
  if (!repo || !stats || !Array.isArray(b.graves)) return null
  if (!isString(repo.fullName) || !isString(repo.commitSha)) return null
  if (!isNumber(stats.filesRead) || !isNumber(stats.filesDiscovered) || !isNumber(stats.markerCount)) return null
  return {
    fullName: repo.fullName,
    commitSha: repo.commitSha,
    graves: b.graves.map(readGrave).filter((g): g is RepoGrave => g !== null),
    filesRead: stats.filesRead,
    filesDiscovered: stats.filesDiscovered,
    markerCount: stats.markerCount,
    languages: Array.isArray(stats.languages) ? stats.languages.filter(isString) : [],
    truncated: b.truncated === true,
  }
}

/** Never throws: failures come back as a reason in plain words. */
export async function scanRepo(url: string, signal?: AbortSignal): Promise<RepoScanResult> {
  const result = await postJson(apiUrl('/api/repositories/graveyard'), { url }, signal)
  if (!result.ok) return result
  const graveyard = readGraveyard(result.body)
  return graveyard ? { ok: true, graveyard } : { ok: false, reason: 'The server sent an answer that could not be read.' }
}

/** A link to the exact line on GitHub, pinned to the commit that was read. */
export const lineUrl = (graveyard: RepoGraveyard, grave: RepoGrave): string =>
  `https://github.com/${graveyard.fullName}/blob/${graveyard.commitSha}/${grave.path.split('/').map(encodeURIComponent).join('/')}#L${grave.line}`