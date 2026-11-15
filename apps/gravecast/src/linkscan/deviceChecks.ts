/**
 * Link checks that run on this device, with no network. Each one reads a fact
 * from the address itself, so every grave traces back to something in the link.
 * Checks that need the internet (where the link redirects, the site's age,
 * known-bad lists, the certificate) are listed as not checked.
 */
import { decodePunycode } from './punycode';

/** How serious a grave is. Maps to tombstone weathering. */
export type GraveSeverity = 'note' | 'caution' | 'warning' | 'danger';

/** One problem found in a link. */
export interface Grave {
  id: string;
  severity: GraveSeverity;
  /** A short name for the problem. */
  title: string;
  /** The exact part of the link it comes from. */
  evidence: string;
  /** What it means, in plain words. */
  detail: string;
  /** Replaces the severity word, such as "Missing protection". */
  label?: string;
}

/** What the link really is, once read. */
export interface LinkSummary {
  /** The address as the browser reads it. */
  href: string;
  /** The site the link opens, as sent (punycode if it has any). */
  host: string;
  /** The same name with international letters shown as letters. */
  displayHost: string;
  secure: boolean;
}

export type DeviceCheckResult =
  | { ok: true; link: LinkSummary; graves: Grave[] }
  | { ok: false; reason: string };

/** Links longer than this are refused, so a check never has to chew on a huge paste. */
export const MAX_LINK_LENGTH = 2048;

/** Checked by Gravecast's server, so listed as not checked when it can't be reached. */
export const CHECKED_ON_SERVER: readonly string[] = [
  'Where the link really leads, if it forwards you somewhere else',
  'Whether the site’s security certificate is valid',
  'Which protections the site sets for its visitors',
];

/** Not checked by anything yet. Shown with every result, so the verdict stays honest. */
export const NOT_CHECKED_YET: readonly string[] = [
  'How long the site has existed',
  'Whether the site is on known lists of harmful sites',
];

/** The one-line verdict. It never says "safe". */
export const verdictFor = (graves: readonly Grave[]): string =>
  graves.length === 0
    ? 'No known problems found by these checks.'
    : `${graves.length} ${graves.length === 1 ? 'problem' : 'problems'} found.`;

/** Severities in order, most serious first. */
export const SEVERITY_ORDER: readonly GraveSeverity[] = ['danger', 'warning', 'caution', 'note'];

const WEB_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const OTHER_SCHEME = /^(javascript|data|vbscript|file|blob|about):/i;
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

const decodeOrKeep = (text: string): string => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

/** Reads a pasted link and runs every check this device can run. */
export const checkLinkOnDevice = (raw: string): DeviceCheckResult => {
  const input = raw.trim();
  if (input === '') return { ok: false, reason: 'Paste a link to check.' };
  if (input.length > MAX_LINK_LENGTH) {
    return { ok: false, reason: `That is longer than ${MAX_LINK_LENGTH} characters. Paste a single link.` };
  }
  if (/\s/.test(input)) return { ok: false, reason: 'That has spaces in it. Paste a single link.' };

  const other = OTHER_SCHEME.exec(input);
  if (other) {
    return { ok: false, reason: `This is a “${other[1].toLowerCase()}:” link, not a web address, so it can’t be checked here.` };
  }

  const graves: Grave[] = [];
  const assumedScheme = !WEB_SCHEME.test(input);

  let url: URL;
  try {
    url = new URL(assumedScheme ? `https://${input}` : input);
  } catch {
    return { ok: false, reason: 'That doesn’t read as a web address. Check that the whole link was copied.' };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: `This is a “${url.protocol}” link, not a web address. Only http and https links can be checked.` };
  }
  if (url.hostname === '') return { ok: false, reason: 'That link has no site name in it.' };

  const host = url.hostname;
  const labels = host.split('.');
  const displayHost = labels
    .map((label) => {
      if (!label.startsWith('xn--')) return label;
      try {
        return decodePunycode(label.slice(4));
      } catch {
        return label;
      }
    })
    .join('.');

  if (url.username !== '' || url.password !== '') {
    const hidden = decodeOrKeep(url.password ? `${url.username}:${url.password}` : url.username);
    graves.push({
      id: 'at-sign',
      severity: 'danger',
      title: 'A disguised address',
      evidence: `${hidden}@${host}`,
      detail: `Everything before the “@” is ignored. This link really opens ${displayHost}, not “${hidden}”.`,
    });
  }

  if (labels.some((label) => label.startsWith('xn--'))) {
    graves.push({
      id: 'punycode',
      severity: 'warning',
      title: 'Letters from another alphabet',
      evidence: `${displayHost} (sent as ${host})`,
      detail: 'The name uses letters from outside the basic English alphabet. Some of them look exactly like English letters, so a fake name can look real.',
    });
  }

  const isIp = IPV4.test(host) || host.startsWith('[');
  if (isIp) {
    graves.push({
      id: 'bare-ip',
      severity: 'caution',
      title: 'A number instead of a name',
      evidence: host,
      detail: 'The link points to a bare internet address instead of a site name, so the link doesn’t say which site it is.',
    });
  } else if (!host.includes('.')) {
    graves.push({
      id: 'not-public',
      severity: 'caution',
      title: 'Not a public site name',
      evidence: host,
      detail: 'This name has no dot in it, so it doesn’t point to a public website.',
    });
  }

  if (url.protocol === 'http:') {
    graves.push({
      id: 'no-https',
      severity: 'warning',
      title: 'No encryption',
      evidence: 'http://',
      detail: 'The link uses http, not https. Anything you type on this page can be read on its way to the site.',
    });
  }

  if (url.port !== '') {
    graves.push({
      id: 'port',
      severity: 'caution',
      title: 'An unusual door',
      evidence: `:${url.port}`,
      detail: `The link asks for port ${url.port} instead of the usual one for web pages.`,
    });
  }

  if (assumedScheme) {
    graves.push({
      id: 'no-scheme',
      severity: 'note',
      title: 'No http or https given',
      evidence: input.slice(0, 60),
      detail: 'The link didn’t start with http:// or https://, so it was checked as https://.',
    });
  }

  graves.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

  return {
    ok: true,
    link: { href: url.href, host, displayHost, secure: url.protocol === 'https:' },
    graves,
  };
};
