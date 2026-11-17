/**
 * What the Chat page, the offline database and the service worker all agree on.
 * Plain constants only, so the build can read them too. The limits mirror the
 * server's defaults (apps/api/app/config.py); the server is the authority and
 * rejects anything that breaks its rules.
 */

/** The echoes every phone follows. People can create more channels; those come from the server's list. */
/** How many channels the Radio dial has. */
export const RADIO_CHANNEL_COUNT = 9

/** The echoes behind the Radio dial, RADIO-1 to RADIO-9. Chat never lists them or opens them. */
export const RADIO_CHANNELS: readonly string[] = Array.from({ length: RADIO_CHANNEL_COUNT }, (_, i) => `RADIO-${i + 1}`)

/** The echo for one Radio channel, counting from 1. */
export const radioEcho = (channel: number): string => `RADIO-${channel}`

/** Whether an echo belongs to the Radio dial. */
export const isRadioEcho = (name: string): boolean => RADIO_CHANNELS.includes(name)

export const BUILTIN_ECHOES: readonly string[] = ['EMERGENCY', 'DEMO', ...RADIO_CHANNELS]

/** An echo's name. Created channels follow {@link ECHO_NAME_PATTERN}. */
export type Echo = string

/** The echo a phone opens by default. DEMO is for testing. */
export const DEFAULT_ECHO: Echo = 'EMERGENCY'

/** A channel name, the way FidoNet wrote echo tags: a capital letter, then capitals, digits, dashes or underscores. */
export const ECHO_NAME_PATTERN = /^[A-Z][A-Z0-9_-]{1,19}$/
export const MAX_ECHO_NAME_CHARS = 20
export const MAX_ECHO_ABOUT_CHARS = 80

/** The most echoes one mail run reads (the server's cap). */
export const MAX_FOLLOWED_ECHOES = 30

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

/** Settings kept in the `meta` store. */
export const META_KEYS = {
  /** The channels this phone follows, besides the built-in ones. */
  joined: 'joined',
  /** The server's channel list, kept for when there is no connection. */
  echoList: 'echoList',
  cursors: 'cursors',
} as const

/** How many mail-run rounds to make in a row when an echo has more waiting. */
export const MAX_RUN_ROUNDS = 5
