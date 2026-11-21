/** How a repo grave is shown: its severity and category in words, and the weathering of its stone (docs/REPO_SCAN_DESIGN.md §3, §11). */
import type { TombstoneWeathering } from 'groove-ui'
import type { RepoCategory, RepoConfidence, RepoSeverity } from './repoScan'

export const SEVERITY_WORD: Record<RepoSeverity, string> = {
  critical: 'Critical',
  high: 'High risk',
  medium: 'Medium risk',
  low: 'Low risk',
  info: 'Note',
}

/** The more serious the finding, the more weathered its stone. */
export const SEVERITY_WEATHERING: Record<RepoSeverity, TombstoneWeathering> = {
  critical: 'crumbling',
  high: 'cracked',
  medium: 'aged',
  low: 'pristine',
  info: 'pristine',
}

export const CATEGORY_WORD: Record<RepoCategory, string> = {
  'vulnerable-dependency': 'Vulnerable dependency',
  secret: 'Leaked secret',
  injection: 'Injection',
  'access-control': 'Access control',
  crypto: 'Cryptography',
  authentication: 'Authentication',
  misconfiguration: 'Misconfiguration',
  'supply-chain': 'Supply chain',
  exposure: 'Information exposure',
  'code-note': 'Code note',
}

export const CONFIDENCE_WORD: Record<RepoConfidence, string> = {
  confirmed: 'Confirmed',
  likely: 'Likely',
  possible: 'Possible',
}

/** What the repo scan never looks at, whatever the repo (design §1). */
export const REPO_STANDING_LIMITS: readonly string[] = [
  'Running the code: every check reads files only, so problems that show up only at run time are not found',
  'Code rules for languages other than Python, JavaScript and TypeScript (other files are read for secrets and code notes)',
  'Code that is never used',
  'The git history, so secrets removed in older commits are not found',
  'Folders such as node_modules, vendor and build output, and Markdown files',
]

/** The last part of a path, for labels with little room. */
export const fileName = (path: string): string => path.slice(path.lastIndexOf('/') + 1)
