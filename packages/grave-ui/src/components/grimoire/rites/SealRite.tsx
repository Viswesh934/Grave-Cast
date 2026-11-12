/**
 * SealRite - Lock a message with a passphrase, and open it again
 * @module components/grimoire/rites/SealRite
 */

import { useEffect, useState, type CSSProperties } from 'react';
import { SEAL_TEXT_LIMIT, judgePassphrase, sealCapability, sealRite } from '../../../grimoire/rites/seal';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useCopyText } from '../../../hooks/useCopyText';
import { useRite } from '../../../hooks/useRite';
import { useSeal } from '../../../hooks/useSeal';
import { Button } from '../../primitives/Button';
import { RiteInput, RiteSection, RiteSegmented } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens, riteTones, type RiteTone } from '../tokens';
import { codeTag, note, row, stack } from './styles';

/** What the Seal panel is doing. */
export type SealMode = 'seal' | 'open';

const MODES = [
  { value: 'seal', label: 'Seal a message' },
  { value: 'open', label: 'Open a seal' },
] as const;

const STRENGTH_TONES: Record<number, RiteTone> = { 0: 'neutral', 1: 'bad', 2: 'warn', 3: 'good', 4: 'good' };

const surface = riteTokens.surface;

/**
 * Props for {@link SealRite}.
 */
export interface SealRiteProps {
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Seal: write a message, choose a passphrase, and get back text that
 * only that passphrase opens. Paste it anywhere; open it here again. The
 * passphrase never leaves the page and nothing is stored.
 *
 * @example
 * ```tsx
 * <SealRite />
 * ```
 */
export const SealRite = ({ headingLevel = 2, className, style }: SealRiteProps) => {
  const rite = useRite(sealCapability, { start: () => true });
  const awake = rite.status === 'active';
  const seal = useSeal();
  const { copy, copied, error: copyError } = useCopyText();
  const { announce } = useAriaAnnounce();
  const [mode, setMode] = useState<SealMode>('seal');
  const [message, setMessage] = useState('');
  const [sealed, setSealed] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [result, setResult] = useState<string | null>(null);

  // Forget everything when the rite is put away.
  useEffect(() => {
    if (awake) return;
    setMessage('');
    setSealed('');
    setPassphrase('');
    setResult(null);
  }, [awake]);

  const switchMode = (next: SealMode) => {
    setMode(next);
    setResult(null);
    seal.clearError();
  };

  const strength = judgePassphrase(passphrase);
  const tooLong = message.length > SEAL_TEXT_LIMIT;
  const canSeal = message.trim() !== '' && passphrase !== '' && !tooLong && !seal.busy;
  const canOpen = sealed.trim() !== '' && passphrase !== '' && !seal.busy;

  const run = async () => {
    if (mode === 'seal') {
      const locked = await seal.seal(message, passphrase);
      if (locked) {
        setResult(locked);
        announce('Sealed. Copy it and keep the passphrase somewhere safe.');
      }
    } else {
      const opened = await seal.open(sealed, passphrase);
      if (opened !== null) {
        setResult(opened);
        announce('The seal is open.');
      }
    }
  };

  return (
    <RiteShell
      name={sealRite.name}
      tagline={sealRite.tagline}
      sigil={sealRite.sigil}
      accent={sealRite.accent}
      rite={rite}
      startLabel="Warm the wax"
      stopLabel="Put it away"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Locked with AES-GCM and a stretched passphrase. Lose the passphrase and the message cannot be opened."
    >
      {!awake ? (
        <p style={{ ...note, color: surface.text }}>Warm the wax to seal a message with a passphrase, or to open one.</p>
      ) : (
        <div style={stack}>
          <RiteSegmented label="What to do" value={mode} onChange={switchMode} options={MODES} />

          {mode === 'seal' ? (
            <RiteInput
              label="Message"
              value={message}
              onChange={setMessage}
              multiline
              placeholder="Meet me at the old gate at midnight."
              error={tooLong ? `Keep it under ${SEAL_TEXT_LIMIT} characters.` : null}
            />
          ) : (
            <RiteInput
              label="Sealed message"
              value={sealed}
              onChange={setSealed}
              multiline
              placeholder="seal1…"
              hint="Paste the whole sealed text, starting with seal1."
            />
          )}

          <div style={{ display: 'grid', gap: riteTokens.space.xs }}>
            <RiteInput
              label="Passphrase"
              type="password"
              value={passphrase}
              onChange={setPassphrase}
              autoComplete={mode === 'seal' ? 'new-password' : 'current-password'}
              onEnter={() => void ((mode === 'seal' ? canSeal : canOpen) && run())}
            />
            {mode === 'seal' && passphrase !== '' && (
              <span style={{ ...note, color: riteTones[STRENGTH_TONES[strength.score]] }}>
                {strength.label}. {strength.advice}
              </span>
            )}
          </div>

          <div style={row}>
            <Button size="sm" variant="secondary" disabled={mode === 'seal' ? !canSeal : !canOpen} onClick={() => void run()}>
              {mode === 'seal' ? 'Seal it' : 'Open it'}
            </Button>
            <span role="status" style={note}>
              {seal.busy ? 'Stretching the passphrase. This takes a moment on purpose.' : ''}
            </span>
          </div>

          {seal.error && (
            <p role="alert" style={{ ...note, color: riteTones.bad }}>
              {seal.error}
            </p>
          )}

          {result !== null && (
            <RiteSection
              title={mode === 'seal' ? 'Sealed message' : 'The message'}
              actions={
                mode === 'seal' && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => void copy(result)}>
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        switchMode('open');
                        setSealed(result);
                        setPassphrase('');
                      }}
                    >
                      Try opening it
                    </Button>
                  </>
                )
              }
            >
              {mode === 'seal' ? (
                <code style={{ ...codeTag, display: 'block', wordBreak: 'break-all' }}>{result}</code>
              ) : (
                <p style={{ ...note, color: surface.text, whiteSpace: 'pre-wrap' }}>{result}</p>
              )}
              {copyError && <p style={note}>{copyError}</p>}
            </RiteSection>
          )}
        </div>
      )}
    </RiteShell>
  );
};
