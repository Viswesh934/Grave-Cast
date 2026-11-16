/**
 * Asks Gravecast's server to open a link once, passively, and report where it
 * leads and which protections the site sets. The server never runs the page.
 */
import { apiUrl, postJson } from '../shared/api';
import type { Grave, GraveSeverity } from './deviceChecks';

export interface LinkHop {
  url: string;
  status: number;
}

export interface ServerScan {
  finalUrl: string;
  statusCode: number | null;
  hops: LinkHop[];
  graves: Grave[];
  /** False when the visit stopped early, for example on a bad certificate. */
  headersChecked: boolean;
}

export type ServerScanResult = { ok: true; scan: ServerScan } | { ok: false; reason: string };

const SEVERITIES: readonly GraveSeverity[] = ['note', 'caution', 'warning', 'danger'];

const isString = (value: unknown): value is string => typeof value === 'string';

/** Keeps only well-formed graves; the server is trusted, but not blindly. */
const readGrave = (value: unknown): Grave | null => {
  if (typeof value !== 'object' || value === null) return null;
  const g = value as Record<string, unknown>;
  if (!isString(g.id) || !isString(g.title) || !isString(g.evidence) || !isString(g.detail)) return null;
  if (!SEVERITIES.includes(g.severity as GraveSeverity)) return null;
  return {
    id: `server-${g.id}`,
    severity: g.severity as GraveSeverity,
    title: g.title,
    evidence: g.evidence,
    detail: g.detail,
    label: isString(g.label) ? g.label : undefined,
  };
};

const readScan = (body: unknown): ServerScan | null => {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (!isString(b.finalUrl) || !Array.isArray(b.graves) || !Array.isArray(b.hops)) return null;
  return {
    finalUrl: b.finalUrl,
    statusCode: typeof b.statusCode === 'number' ? b.statusCode : null,
    hops: b.hops.filter(
      (h): h is LinkHop => typeof h === 'object' && h !== null && isString((h as LinkHop).url) && typeof (h as LinkHop).status === 'number',
    ),
    graves: b.graves.map(readGrave).filter((g): g is Grave => g !== null),
    headersChecked: b.headersChecked === true,
  };
};

/** Opens `href` on the server. Never throws; failures come back as a reason in plain words. */
export async function scanOnServer(href: string, signal?: AbortSignal): Promise<ServerScanResult> {
  const result = await postJson(apiUrl('/api/linkscan/scan'), { url: href }, signal);
  if (!result.ok) return result;
  const scan = readScan(result.body);
  return scan ? { ok: true, scan } : { ok: false, reason: 'The server sent an answer that could not be read.' };
}

/** The site name in a full address, or the address itself if it can't be read. */
export const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};
