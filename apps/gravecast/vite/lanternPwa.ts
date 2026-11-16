/**
 * Makes Lantern installable and offline: its web manifest, its
 * icons, and a service worker that precaches exactly the files its page uses.
 * Nothing from the website is cached. Colours come from Groove UI's grove palette, the same green night as the site.
 */
import { createHash } from 'node:crypto'
import { deflateSync } from 'node:zlib'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { palette } from '../../../packages/grave-ui/src/tokens/colors.ts'
import { BUILTIN_ECHOES, CHANNEL_DB, MAIL_RUN_PATH, MAX_FOLLOWED_ECHOES, MAX_RUN_MESSAGES, MAX_RUN_ROUNDS, SYNC_TAG } from '../src/shared/channelContract.ts'

/** Where Lantern lives. Its manifest and service worker are scoped here. */
export const LANTERN_BASE = '/lantern/'

const HTML_FILE = 'lantern/index.html'
const SW_FILE = 'lantern/sw.js'
const MANIFEST_FILE = 'lantern/manifest.webmanifest'
const CACHE_PREFIX = 'gravecast-lantern-'

interface IconSpec {
  file: string
  size: number
  /** Maskable icons keep the drawing inside the middle 80%, the safe zone. */
  maskable: boolean
}

const ICONS: readonly IconSpec[] = [
  { file: 'lantern/icon-192.png', size: 192, maskable: false },
  { file: 'lantern/icon-512.png', size: 512, maskable: false },
  { file: 'lantern/icon-maskable-512.png', size: 512, maskable: true },
]

/** Share of the icon the drawing fills: the whole canvas, or the maskable safe zone. */
const ICON_FILL = { any: 0.82, maskable: 0.62 } as const
/** Samples per pixel along each side, for smooth edges. */
const ICON_SUPERSAMPLE = 4

const manifest = () => ({
  id: LANTERN_BASE,
  name: 'Gravecast Lantern',
  short_name: 'Lantern',
  description: 'Survival guides that work with no internet.',
  start_url: LANTERN_BASE,
  scope: LANTERN_BASE,
  display: 'standalone',
  background_color: palette.grove[950],
  theme_color: palette.grove[950],
  icons: ICONS.map((icon) => ({
    src: `/${icon.file}`,
    sizes: `${icon.size}x${icon.size}`,
    type: 'image/png',
    purpose: icon.maskable ? 'maskable' : 'any',
  })),
})

// ---- Icons: a headstone with a plus, drawn into a PNG with no image library ----

const rgb = (hex: string): [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
]

/** 0 for background, 1 for the stone, 2 for the plus cut into it. Coordinates run 0 to 1. */
const shapeAt = (u: number, v: number): 0 | 1 | 2 => {
  const plus = (u > 0.455 && u < 0.545 && v > 0.36 && v < 0.7) || (v > 0.47 && v < 0.56 && u > 0.36 && u < 0.64)
  const archCentre = { u: 0.5, v: 0.36 }
  const arch = v <= archCentre.v && (u - archCentre.u) ** 2 + (v - archCentre.v) ** 2 <= 0.24 ** 2
  const body = u >= 0.26 && u <= 0.74 && v >= archCentre.v && v <= 0.84
  const base = u >= 0.16 && u <= 0.84 && v > 0.84 && v <= 0.95
  if (arch || body) return plus ? 2 : 1
  return base ? 1 : 0
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

const crc32 = (data: Buffer) => {
  let c = 0xffffffff
  for (const byte of data) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const pngChunk = (type: string, data: Buffer) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

export const drawIcon = (size: number, maskable: boolean): Buffer => {
  const ground = rgb(palette.grove[900])
  const stone = rgb(palette.grove.bone200)
  const fill = maskable ? ICON_FILL.maskable : ICON_FILL.any
  const samples = ICON_SUPERSAMPLE * ICON_SUPERSAMPLE
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1)
    raw[row] = 0 // no PNG row filter
    for (let x = 0; x < size; x++) {
      let lit = 0
      for (let sy = 0; sy < ICON_SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < ICON_SUPERSAMPLE; sx++) {
          const u = ((x + (sx + 0.5) / ICON_SUPERSAMPLE) / size - 0.5) / fill + 0.5
          const v = ((y + (sy + 0.5) / ICON_SUPERSAMPLE) / size - 0.5) / fill + 0.5
          if (shapeAt(u, v) === 1) lit++
        }
      }
      const share = lit / samples
      for (let c = 0; c < 3; c++) raw[row + 1 + x * 3 + c] = Math.round(ground[c] + (stone[c] - ground[c]) * share)
    }
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // truecolour RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ---- The service worker ----

/**
 * The background mail run: when the browser says the connection is back, send the
 * outbox from the same offline database the page uses. It does what
 * src/lantern/chat/mailRun.ts does; keep the two in step. Plain JavaScript,
 * written without template strings so it can sit inside the one below.
 */
const mailRunScript = (apiBase: string) => `
// ---- Background mail run (Chat) ----
const API = ${JSON.stringify(apiBase)};
const DB = ${JSON.stringify(CHANNEL_DB)};
const MAIL_RUN_PATH = ${JSON.stringify(MAIL_RUN_PATH)};
const MAX_RUN_MESSAGES = ${MAX_RUN_MESSAGES};
const MAX_RUN_ROUNDS = ${MAX_RUN_ROUNDS};
const BUILTIN = ${JSON.stringify(BUILTIN_ECHOES)};
const MAX_FOLLOWED = ${MAX_FOLLOWED_ECHOES};
const SYNC_TAG = ${JSON.stringify(SYNC_TAG)};

function openDb() {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(DB.name, DB.version);
    request.onupgradeneeded = function () {
      const db = request.result;
      Object.values(DB.stores).forEach(function (name) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: name === DB.stores.meta ? 'key' : 'msgid' });
      });
    };
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error); };
  });
}
function wrap(request) {
  return new Promise(function (resolve, reject) {
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error); };
  });
}
function finished(tx) {
  return new Promise(function (resolve, reject) {
    tx.oncomplete = function () { resolve(); };
    tx.onerror = tx.onabort = function () { reject(tx.error); };
  });
}

async function mailRun() {
  const db = await openDb();
  try {
    for (let round = 0; round < MAX_RUN_ROUNDS; round++) {
      const read = db.transaction([DB.stores.outbox, DB.stores.meta], 'readonly');
      const outbox = await wrap(read.objectStore(DB.stores.outbox).getAll());
      const cursorRow = await wrap(read.objectStore(DB.stores.meta).get('cursors'));
      const joinedRow = await wrap(read.objectStore(DB.stores.meta).get('joined'));
      // Same as followedCursors in src/lantern/chat/mailRun.ts: built-in echoes, then joined ones; left ones dropped.
      const stored = cursorRow ? cursorRow.value : {};
      const followed = BUILTIN.concat((joinedRow && joinedRow.value) || []).filter(function (a, i, all) { return all.indexOf(a) === i; }).slice(0, MAX_FOLLOWED);
      const cursors = {};
      followed.forEach(function (a) { cursors[a] = stored[a] || 0; });
      outbox.sort(function (a, b) { return a.sentAt < b.sentAt ? -1 : a.sentAt > b.sentAt ? 1 : 0; });
      const batch = outbox.slice(0, MAX_RUN_MESSAGES);
      const response = await fetch(API + MAIL_RUN_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: batch, cursors: cursors }),
      });
      if (!response.ok) throw new Error('The mail run was refused: ' + response.status);
      const run = await response.json();
      const bodies = {};
      batch.forEach(function (m) { bodies[m.msgid] = m.body; });
      const refused = run.rejected.map(function (r) { return { msgid: r.msgid, reason: r.reason, body: bodies[r.msgid] || '' }; });
      const write = db.transaction([DB.stores.messages, DB.stores.outbox, DB.stores.meta], 'readwrite');
      const out = write.objectStore(DB.stores.outbox);
      const meta = write.objectStore(DB.stores.meta);
      run.accepted.forEach(function (id) { out.delete(id); });
      refused.forEach(function (r) { out.delete(r.msgid); });
      run.messages.forEach(function (m) { write.objectStore(DB.stores.messages).put(m); });
      const before = await wrap(meta.get('refused'));
      if (refused.length > 0) meta.put({ key: 'refused', value: ((before && before.value) || []).concat(refused) });
      meta.put({ key: 'cursors', value: Object.assign({}, cursors, run.cursors) });
      meta.put({ key: 'lastRunAt', value: run.serverTime });
      await finished(write);
      if (!run.more && outbox.length - run.accepted.length - run.rejected.length <= 0) break;
    }
  } finally {
    db.close();
  }
}

// The browser fires this when the connection is back, even with the app closed.
self.addEventListener('sync', function (event) {
  if (event.tag === SYNC_TAG) event.waitUntil(mailRun());
});
`
const serviceWorker = (cacheName: string, files: readonly string[], apiBase: string) => `/* Gravecast Lantern service worker. Generated at build time; do not edit. */
const CACHE = ${JSON.stringify(cacheName)};
const FILES = ${JSON.stringify(files)};
const SHELL = ${JSON.stringify(`/${HTML_FILE}`)};
const SCOPE = ${JSON.stringify(LANTERN_BASE)};

self.addEventListener('install', (event) => {
  // Takes over at once. The page reloads when that happens (see useAppStatus), so it never mixes versions.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(${JSON.stringify(CACHE_PREFIX)}) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Only this site's own files. The API and other sites always go to the network.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    if (!url.pathname.startsWith(SCOPE)) return;
    // Every page in the section is the same app: open it from the cache first.
    event.respondWith(caches.match(SHELL).then((cached) => cached || fetch(request)));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

${mailRunScript(apiBase)}`

// ---- Dev and preview: serve the section's pages, manifest and icons ----

/** Where this section used to live, before it was called Lantern. */
const OLD_BASE = '/emergency/'
const OLD_SW_FILE = 'emergency/sw.js'

/**
 * Served at the old address, so a phone that installed the old version lets it go:
 * it deletes the old cache, removes itself, and sends any open window to Lantern.
 * Chat's outbox lives in IndexedDB, which the whole site shares, so nothing is lost.
 */
const retiredWorker = () => `/* Gravecast: the old Emergency worker, retired. Generated at build time; do not edit. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('gravecast-emergency-')).map((key) => caches.delete(key)));
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach((client) => client.navigate(${JSON.stringify(LANTERN_BASE)}));
  })());
});
`

const hasExtension = (path: string) => /\.[a-z0-9]+$/i.test(path.slice(path.lastIndexOf('/') + 1))

const routeLantern =
  (serveGenerated: boolean) =>
  (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    const [path, query] = (req.url ?? '').split('?')
    if (path === `/${OLD_SW_FILE}`) {
      res.setHeader('Content-Type', 'text/javascript')
      res.setHeader('Cache-Control', 'no-cache')
      res.end(retiredWorker())
      return
    }
    // Old links still work.
    if (path === OLD_BASE.slice(0, -1) || path.startsWith(OLD_BASE)) {
      res.statusCode = 302
      res.setHeader('Location', LANTERN_BASE + path.slice(OLD_BASE.length) + (query ? `?${query}` : ''))
      res.end()
      return
    }
    if (path === LANTERN_BASE.slice(0, -1)) {
      res.statusCode = 301
      res.setHeader('Location', LANTERN_BASE)
      res.end()
      return
    }
    if (!path.startsWith(LANTERN_BASE)) return next()
    if (serveGenerated && path === `/${MANIFEST_FILE}`) {
      res.setHeader('Content-Type', 'application/manifest+json')
      res.end(JSON.stringify(manifest(), null, 2))
      return
    }
    const icon = serveGenerated ? ICONS.find((i) => path === `/${i.file}`) : undefined
    if (icon) {
      res.setHeader('Content-Type', 'image/png')
      res.end(drawIcon(icon.size, icon.maskable))
      return
    }
    // Any page in the section opens the section's own page.
    if (!hasExtension(path)) req.url = `/${HTML_FILE}`
    next()
  }

interface ChunkLike {
  type: 'chunk'
  fileName: string
  imports: readonly string[]
  dynamicImports: readonly string[]
  viteMetadata?: { importedCss: Set<string>; importedAssets: Set<string> }
}

export function lanternPwa(): Plugin {
  // Where the API lives, so the service worker can reach it. Empty means the same site.
  let apiBase = ''
  return {
    name: 'gravecast-lantern-pwa',
    enforce: 'post',

    configResolved(config) {
      apiBase = String(config.env.VITE_API_URL ?? '').replace(/\/+$/, '')
    },

    configureServer(server) {
      server.middlewares.use(routeLantern(true))
    },

    configurePreviewServer(server) {
      server.middlewares.use(routeLantern(false))
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.path.startsWith(LANTERN_BASE)) return html
        return {
          html,
          tags: [
            { tag: 'meta', attrs: { name: 'theme-color', content: palette.grove[950] }, injectTo: 'head' },
            // The page's own colours before its stylesheet arrives, so it never flashes white.
            { tag: 'style', children: `html{background:${palette.grove[950]};color:${palette.grove.bone100};color-scheme:dark}`, injectTo: 'head' },
          ],
        }
      },
    },

    generateBundle(_options, bundle) {
      const html = bundle[HTML_FILE]
      if (!html || html.type !== 'asset') return
      const htmlSource = String(html.source)

      const files = new Set<string>([HTML_FILE])
      const visit = (fileName: string) => {
        if (files.has(fileName)) return
        files.add(fileName)
        const item = bundle[fileName] as unknown as ChunkLike | undefined
        if (!item || item.type !== 'chunk') return
        item.viteMetadata?.importedCss.forEach((css) => files.add(css))
        item.viteMetadata?.importedAssets.forEach((asset) => files.add(asset))
        item.imports.forEach(visit)
        item.dynamicImports.forEach(visit)
      }
      // Everything the page links to, and everything those files load in turn.
      for (const match of htmlSource.matchAll(/(?:src|href)="\/([^"#?]+)"/g)) {
        if (match[1] !== MANIFEST_FILE && !ICONS.some((i) => i.file === match[1])) visit(match[1])
      }

      this.emitFile({ type: 'asset', fileName: MANIFEST_FILE, source: JSON.stringify(manifest(), null, 2) })
      for (const icon of ICONS) this.emitFile({ type: 'asset', fileName: icon.file, source: drawIcon(icon.size, icon.maskable) })
      files.add(MANIFEST_FILE)
      ICONS.forEach((icon) => files.add(icon.file))

      const list = [...files].sort().map((file) => `/${file}`)
      const version = createHash('sha256').update(list.join('\n')).update(htmlSource).digest('hex').slice(0, 12)
      this.emitFile({ type: 'asset', fileName: OLD_SW_FILE, source: retiredWorker() })
      this.emitFile({ type: 'asset', fileName: SW_FILE, source: serviceWorker(`${CACHE_PREFIX}${version}`, list, apiBase) })
    },
  }
}
