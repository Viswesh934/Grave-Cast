/**
 * What the Chat page, the offline database and the service worker all agree on.
 * Plain constants only, so the build can read them too. The limits mirror the
 * server's defaults (apps/api/app/config.py); the server is the authority and
 * rejects anything that breaks its rules.
 */

/** The public message areas. */
export const ECHOES = ['EMERGENCY', 'DEMO'] as const
export type Echo = (typeof ECHOES)[number]

/** The echo a phone joins by default. DEMO is for testing. */
export const DEFAULT_ECHO: Echo = 'EMERGENCY'

export const MAX_BODY_CHARS = 500
export const MAX_NICK_CHARS = 24
/** The most messages one mail run carries. */
export const MAX_RUN_MESSAGES = 20
/** A nickname starts with a letter or digit, then may also use spaces, dots, dashes and underscores. */
export const NICK_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,23}$/

export const MAIL_RUN_PATH = '/api/channel/mailrun'
export const ECHO_PATH = '/api/channel/echoes'

/** The Background Sync tag that asks the service worker to make a mail run. */
export const SYNC_TAG = 'gravecast-mail-run'
/** Stops two tabs making a mail run at the same moment. */
export const MAIL_LOCK = 'gravecast-mail-run'

/** The phone's own copy of Chat: messages it has read, the outbox, and small settings. */
export const CHANNEL_DB = {
  name: 'gravecast-channel',
  version: 1,
  stores: { messages: 'messages', outbox: 'outbox', meta: 'meta' },
} as const

/** How many mail-run rounds to make in a row when an echo has more waiting. */
export const MAX_RUN_ROUNDS = 5