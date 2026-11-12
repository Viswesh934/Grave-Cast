/**
 * CryptRite - Keep things on this device, and see what the site stores
 * @module components/grimoire/rites/CryptRite
 */

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { cryptCapability, cryptRite, inspectStorage, openCrypt, requestPersistence, type Crypt, type StorageReport } from '../../../grimoire/rites/crypt';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useRite } from '../../../hooks/useRite';
import { Button } from '../../primitives/Button';
import { formatBytes, formatTimeOfDay } from '../format';
import { RiteEmpty, RiteInput, RiteSection, RiteStat, RiteStatGrid } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens, riteTones } from '../tokens';
import { codeTag, columns, note, plainList, row, stack } from './styles';

/** The database the Crypt rite keeps its keepsakes in. */
export const CRYPT_DATABASE = 'grimoire-crypt';
/** The store inside it. */
export const CRYPT_STORE = 'keepsakes';
/** Longest CryptKeepsake title, in characters. */
export const KEEPSAKE_TITLE_LIMIT = 60;
/** Longest CryptKeepsake text, in characters. */
export const KEEPSAKE_WORDS_LIMIT = 500;

/** One thing buried in the crypt. */
export interface CryptKeepsake {
  title: string;
  words: string;
  /** When it was buried, in ms since 1970. */
  buriedAt: number;
}

/** Percent in one whole. */
const PERCENT = 100;
/** Decimal places of the share of storage used. */
const SHARE_DECIMALS = 2;

const { space, font, radius, line } = riteTokens;
const surface = riteTokens.surface;

const yesNo = (value: boolean | null, yes: string, no: string) => (value === null ? 'Unknown' : value ? yes : no);

/**
 * Props for {@link CryptRite}.
 */
export interface CryptRiteProps {
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Crypt: bury a few words on this device with IndexedDB, close the tab,
 * and they are still here when you come back. It also shows everything this
 * site keeps on the device, and can ask the browser never to clear it.
 *
 * @example
 * ```tsx
 * <CryptRite />
 * ```
 */
export const CryptRite = ({ headingLevel = 2, className, style }: CryptRiteProps) => {
  const rite = useRite<Crypt>(cryptCapability, {
    start: () => openCrypt({ name: CRYPT_DATABASE, stores: [CRYPT_STORE] }),
    stop: (crypt) => crypt.close(),
  });
  const crypt = rite.value;
  const [keepsakes, setKeepsakes] = useState<{ key: string; value: CryptKeepsake }[]>([]);
  const [opened, setOpened] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [words, setWords] = useState('');
  const [report, setReport] = useState<StorageReport | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const { announce } = useAriaAnnounce();

  const reload = useCallback(async () => {
    if (!crypt) return;
    try {
      const entries = await crypt.list<CryptKeepsake>(CRYPT_STORE);
      setKeepsakes(entries.map((entry) => ({ key: String(entry.key), value: entry.value })).reverse());
      setReport(await inspectStorage());
      setFailure(null);
    } catch {
      setFailure('The crypt could not be read. Try closing and opening it again.');
    }
  }, [crypt]);

  useEffect(() => {
    if (!crypt) {
      setKeepsakes([]);
      setReport(null);
      return;
    }
    void reload();
  }, [crypt, reload]);

  const titleError = title.length > KEEPSAKE_TITLE_LIMIT ? `Keep the title under ${KEEPSAKE_TITLE_LIMIT} characters.` : null;
  const wordsError = words.length > KEEPSAKE_WORDS_LIMIT ? `Keep it under ${KEEPSAKE_WORDS_LIMIT} characters.` : null;
  const canBury = title.trim() !== '' && words.trim() !== '' && !titleError && !wordsError;

  const run = async (work: () => Promise<unknown>, done: string) => {
    try {
      await work();
      announce(done);
    } catch {
      setFailure('That did not work. The browser may be out of space for this site.');
    }
    await reload();
  };

  const bury = () => {
    if (!crypt || !canBury) return;
    const buriedAt = Date.now();
    const CryptKeepsake: CryptKeepsake = { title: title.trim(), words: words.trim(), buriedAt };
    setTitle('');
    setWords('');
    void run(() => crypt.bury<CryptKeepsake>(CRYPT_STORE, `CryptKeepsake-${buriedAt}`, CryptKeepsake), `Buried ${CryptKeepsake.title}.`);
  };

  const usedShare = report?.usage != null && report.quota ? report.usage / report.quota : null;

  return (
    <RiteShell
      name={cryptRite.name}
      tagline={cryptRite.tagline}
      sigil={cryptRite.sigil}
      accent={cryptRite.accent}
      rite={rite}
      startLabel="Open the crypt"
      stopLabel="Close the crypt"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Everything stays on this device. Clearing site data in the browser empties the crypt."
    >
      {!crypt ? (
        <p style={{ ...note, color: surface.text }}>Open the crypt to bury a few words. Close the tab, come back, and they are still here.</p>
      ) : (
        <div style={stack}>
          {failure && (
            <p role="alert" style={{ ...note, color: riteTones.bad }}>
              {failure}
            </p>
          )}

          <div style={columns}>
            <RiteSection title="Bury a CryptKeepsake">
              <RiteInput label="Title" value={title} onChange={setTitle} placeholder="A note to myself" error={titleError} />
              <RiteInput label="Words" value={words} onChange={setWords} multiline placeholder="Remember the candles." error={wordsError} />
              <div style={row}>
                <Button size="sm" variant="secondary" disabled={!canBury} onClick={bury}>
                  Bury it
                </Button>
              </div>
            </RiteSection>

            <RiteSection
              title={`In the crypt (${keepsakes.length})`}
              actions={
                <Button size="sm" variant="ghost" disabled={keepsakes.length === 0} onClick={() => void run(() => crypt.clear(CRYPT_STORE), 'The crypt is empty.')}>
                  Empty the crypt
                </Button>
              }
            >
              {keepsakes.length === 0 ? (
                <RiteEmpty>Nothing is buried yet.</RiteEmpty>
              ) : (
                <ul aria-label="Keepsakes" style={plainList}>
                  {keepsakes.map(({ key, value }) => (
                    <li
                      key={key}
                      style={{
                        display: 'grid',
                        gap: space.xs,
                        padding: space.sm,
                        border: `${line.hairline} solid ${surface.border}`,
                        borderRadius: radius.md,
                      }}
                    >
                      <div style={{ ...row, justifyContent: 'space-between' }}>
                        <span style={{ fontSize: font.base, color: surface.text, overflowWrap: 'anywhere' }}>{value.title}</span>
                        <div style={{ ...row, gap: space.xs }}>
                          <Button size="sm" variant="ghost" aria-expanded={opened === key} onClick={() => setOpened(opened === key ? null : key)}>
                            {opened === key ? 'Rebury' : 'Exhume'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => void run(() => crypt.forget(CRYPT_STORE, key), `Forgot ${value.title}.`)}>
                            Forget
                          </Button>
                        </div>
                      </div>
                      <span style={note}>Buried at {formatTimeOfDay(value.buriedAt)}</span>
                      {opened === key && <p style={{ ...note, color: surface.text, whiteSpace: 'pre-wrap' }}>{value.words}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </RiteSection>
          </div>

          <RiteSection
            title="What this site keeps"
            actions={
              <Button size="sm" variant="ghost" onClick={() => void reload()}>
                Look again
              </Button>
            }
          >
            {report && (
              <>
                <RiteStatGrid>
                  <RiteStat
                    label="Used"
                    value={report.usage === null ? 'Unknown' : formatBytes(report.usage)}
                    hint={usedShare === null ? undefined : `${(usedShare * PERCENT).toFixed(SHARE_DECIMALS)}% of what is allowed`}
                  />
                  <RiteStat label="Allowed" value={report.quota === null ? 'Unknown' : formatBytes(report.quota)} />
                  <RiteStat
                    label="Kept forever"
                    value={yesNo(report.persisted, 'Yes', 'No')}
                    hint={report.persisted ? 'The browser will not clear it on its own' : 'May be cleared when space runs low'}
                    tone={report.persisted ? 'good' : 'neutral'}
                  />
                </RiteStatGrid>
                {!report.persisted && (
                  <div style={row}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void requestPersistence().then(async (granted) => {
                          announce(granted === null ? 'This browser cannot be asked.' : granted ? 'The browser will keep it.' : 'The browser said no.');
                          await reload();
                        })
                      }
                    >
                      Ask to keep forever
                    </Button>
                    <span style={note}>Browsers often say yes only for sites you visit a lot or have installed.</span>
                  </div>
                )}
                <ul aria-label="Storage on this device" style={plainList}>
                  <li style={note}>
                    Databases:{' '}
                    {report.databases === null
                      ? 'this browser does not list them'
                      : report.databases.length === 0
                        ? 'none'
                        : report.databases.map((database) => (
                            <code key={database.name} style={{ ...codeTag, marginRight: space.xs }}>
                              {database.name}
                            </code>
                          ))}
                  </li>
                  <li style={note}>
                    Local storage: {report.localKeys ?? 'unavailable'} keys. Session storage: {report.sessionKeys ?? 'unavailable'} keys.
                  </li>
                  <li style={note}>Caches: {report.caches === null ? 'unavailable' : report.caches.length === 0 ? 'none' : report.caches.join(', ')}</li>
                  <li style={note}>Cookies this page can read: {report.cookies}</li>
                </ul>
              </>
            )}
          </RiteSection>
        </div>
      )}
    </RiteShell>
  );
};
