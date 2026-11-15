import { useEffect, useRef, useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Button, SoundTrigger, type SoundEvent } from 'groove-ui';

/** Milliseconds a scream shakes the panel. */
const SHAKE_MS = 700;

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'];

const keyframes = `
@keyframes doc-flame {
  0%, 100% { transform: scale(1, 1) rotate(0deg); }
  25% { transform: scale(0.94, 1.06) rotate(-1.5deg); }
  50% { transform: scale(1.04, 0.95) rotate(1deg); }
  75% { transform: scale(0.97, 1.04) rotate(-0.5deg); }
}
@keyframes doc-smoke {
  0% { opacity: 0.7; transform: translateY(0) scaleX(1); }
  100% { opacity: 0; transform: translateY(-46px) scaleX(1.8); }
}
@keyframes doc-shake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-6px, 3px) rotate(-0.6deg); }
  40% { transform: translate(5px, -4px) rotate(0.5deg); }
  60% { transform: translate(-4px, -2px) rotate(-0.4deg); }
  80% { transform: translate(4px, 3px) rotate(0.3deg); }
}
@media (prefers-reduced-motion: reduce) {
  .doc-flame, .doc-smoke, .doc-shake { animation: none !important; }
}
`;

function Candle({ lit, level, holding }: { lit: boolean; level: number; holding: boolean }) {
  // The flame leans and shrinks while you blow, and the glow follows the loudness.
  const lean = holding ? -10 : 0;
  const size = 1 - (holding ? 0.35 : 0) + level * 0.1;

  return (
    <svg viewBox="0 0 120 220" className="h-56 w-auto" role="img" aria-label={lit ? 'A lit candle' : 'A candle that has been put out'}>
      {lit && <circle cx="60" cy="62" r={46 + level * 18} fill="#d4af37" opacity={0.1 + level * 0.12} />}
      <rect x="38" y="96" width="44" height="104" rx="3" fill="#e8e0d5" />
      <path d="M38 118c0 14 5 22 11 22s11-8 11-22z" fill="#d6ccbe" />
      <path d="M70 100c0 10 4 16 9 16s9-6 9-16z" fill="#d6ccbe" opacity="0.8" />
      <ellipse cx="60" cy="200" rx="34" ry="6" fill="#343642" />
      <rect x="58.5" y="82" width="3" height="16" rx="1.5" fill="#22232a" />
      {lit ? (
        <g
          className="doc-flame"
          style={{
            transformOrigin: '60px 86px',
            transformBox: 'fill-box',
            animation: 'doc-flame 1.4s ease-in-out infinite',
            rotate: `${lean}deg`,
            scale: String(size),
          }}
        >
          <path d="M60 34c14 14 20 26 20 38a20 20 0 0 1-40 0c0-10 6-22 20-38z" fill="#d4af37" />
          <path d="M60 52c7 7 10 14 10 20a10 10 0 0 1-20 0c0-6 3-13 10-20z" fill="#f5f2eb" opacity="0.85" />
        </g>
      ) : (
        <g>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="doc-smoke"
              d="M60 84c-6-8 6-14 0-24"
              fill="none"
              stroke="#9da1b6"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ animation: `doc-smoke 2.4s ease-out ${i * 0.7}s infinite` }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

export function SoundTriggerDoc() {
  const [shaking, setShaking] = useState(false);
  const [snuffed, setSnuffed] = useState(false);
  const shakeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(shakeTimer.current), []);

  const handleSound = ({ kind }: SoundEvent) => {
    if (kind !== 'scream') return;
    setShaking(true);
    window.clearTimeout(shakeTimer.current);
    shakeTimer.current = window.setTimeout(() => setShaking(false), SHAKE_MS);
  };

  const codeSnippet = `import { SoundTrigger, Button } from 'groove-ui';

// The microphone is only requested when the user presses the button,
// audio is analysed on the device, and nothing is recorded or sent.
<SoundTrigger
  on="blow"            // 'whisper' | 'voice' | 'blow' | 'scream', or a list
  holdMs={500}         // a puff is ignored; a real blow counts
  onSound={({ kind }) => kind === 'scream' && shakeThePage()}
>
  {({ triggered, reset, level, sound, holding }) => (
    <>
      <Candle lit={!triggered} level={level} holding={holding} />
      {triggered && <Button onClick={reset}>Relight</Button>}
    </>
  )}
</SoundTrigger>

// Prefer your own controls? Use the hooks.
const mic = useOccultMic({ thresholds: { scream: 0.7 } });
const blown = useSoundTrigger(mic, { on: 'blow', holdMs: 500 });`;

  return (
    <ComponentDocPage
      title="SoundTrigger"
      category="The Effects"
      description="Let your page react to the microphone. A held blow puts out a candle, a whisper wakes runes, a scream shakes the room. It listens only after the user presses a button, analyses audio on the device without recording or sending anything, and stops when you leave. Built on useOccultMic and useSoundTrigger, so you can drive anything with the same signals."
      packageName="sound-trigger"
      gothicPhilosophy={{
        influence: 'Candles, Whispers & Things That Listen Back',
        movement: 'Breath, Voice & Sudden Noise',
      }}
      preview={
        <div className="w-full max-w-xl space-y-4">
          <style>{keyframes}</style>

          <SoundTrigger on="blow" holdMs={500} onSound={handleSound}>
            {({ triggered, reset, level, sound, holding }) => {
              const out = triggered || snuffed;
              const relight = () => {
                reset();
                setSnuffed(false);
              };

              return (
                <div
                  className="doc-shake rounded-2xl border border-[#183425] bg-[#05070a] p-6"
                  style={{ animation: shaking ? `doc-shake ${SHAKE_MS}ms linear` : 'none' }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <Candle lit={!out} level={level} holding={holding && !out} />

                    <div
                      aria-hidden="true"
                      className="flex gap-3 font-serif text-2xl transition-all duration-300"
                      style={{
                        color: sound === 'whisper' || sound === 'voice' ? '#10b981' : '#343642',
                        textShadow: sound === 'whisper' || sound === 'voice' ? '0 0 14px #10b981' : 'none',
                      }}
                    >
                      {RUNES.map((rune) => (
                        <span key={rune}>{rune}</span>
                      ))}
                    </div>

                    <p role="status" className="text-center text-sm text-stone-300">
                      {out
                        ? 'The flame is out.'
                        : holding
                          ? 'Keep blowing...'
                          : 'Blow on your microphone to put it out. Speak and the runes wake. Scream and the room shakes.'}
                    </p>

                    <div className="flex gap-2">
                      {out ? (
                        <Button size="sm" variant="gothic" onClick={relight}>
                          Relight
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setSnuffed(true)}>
                          Snuff it out
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          </SoundTrigger>

          <p className="text-center text-xs text-stone-400">
            Headphones recommended, so your speakers do not feed back into the microphone. Blowing is
            detected from low-frequency rumble, so blow gently across the microphone rather than
            into it. Microphones vary, so tune <code>thresholds</code> for yours.
          </p>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'on', type: "SoundKind | SoundKind[]", default: "'blow'", description: "Which sound sets it off: 'whisper', 'voice', 'blow', or 'scream'" },
        { name: 'holdMs', type: 'number', default: '0', description: 'How long the sound must last without a break before it triggers' },
        { name: 'resetAfterMs', type: 'number | null', default: 'null', description: 'Reset automatically after this long. Unset means it stays triggered until reset()' },
        { name: 'onTrigger', type: '(kind: SoundKind) => void', default: '—', description: 'Called once each time it triggers' },
        { name: 'onSound', type: '(event: SoundEvent) => void', default: '—', description: 'Called whenever any sound begins, whatever `on` is' },
        { name: 'thresholds', type: 'Partial<SoundThresholds>', default: '—', description: 'Where each sound begins (levels 0-1), plus blowLowRatio. Tune per microphone' },
        { name: 'cooldownMs', type: 'number', default: '400', description: 'Time before the same kind of sound can be reported again' },
        { name: 'updateHz', type: 'number', default: '20', description: 'How often the level state refreshes. levelRef updates every frame' },
        { name: 'showControls', type: 'boolean', default: 'true', description: 'Show the enable button, level meter, and status line' },
        { name: 'children', type: '(state: SoundTriggerState) => ReactNode', default: '—', description: 'Render prop with triggered, holding, level, sound, status, start, stop, reset' },
      ]}
      prevPage={{ title: 'HorrorBackground', path: '/docs/components/horror-background' }}
      nextPage={{ title: 'ASCII', path: '/docs/components/ascii' }}
    />
  );
}
