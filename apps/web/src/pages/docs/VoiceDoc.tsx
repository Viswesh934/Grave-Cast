import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Field } from '../../components/docs/DocControls';
import { chip, inputClass, selectClass } from '../../components/docs/docStyles';
import {
  Button,
  PERSONAS,
  VOICE_PERSONAS,
  useMediaStream,
  useSpookySpeech,
  useVoiceEcho,
  type EchoState,
  type VoicePersona,
} from 'groove-ui';

const SAMPLE_TEXT = 'Do not look behind you. It has been listening to every word.';
const MAX_TEXT_LENGTH = 400;

const ECHO_STATUS: Record<EchoState, { label: string; dot: string }> = {
  off: { label: 'Microphone off', dot: 'bg-stone-600' },
  listening: { label: 'Listening. Say something, then pause.', dot: 'bg-emerald-400' },
  recording: { label: 'Hearing you...', dot: 'bg-red-500 animate-pulse' },
  processing: { label: 'Changing your voice...', dot: 'bg-amber-400 animate-pulse' },
  speaking: { label: 'Talking back', dot: 'bg-violet-400 animate-pulse' },
};

const panelClass = 'flex flex-col gap-4 rounded-2xl border border-[#183425] bg-[#05070a]/80 p-5';

/** A slim level bar. Decorative: the status text says the same thing. */
function Meter({ label, level, tone }: { label: string; level: number; tone: string }) {
  return (
    <div className="flex-1" aria-hidden="true">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-800">
        <div className={`h-full ${tone} transition-[width] duration-75`} style={{ width: `${Math.round(level * 100)}%` }} />
      </div>
    </div>
  );
}

function PanelHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-400/80">{title}</h3>
      <p className="mt-1 text-xs text-stone-400">{hint}</p>
    </div>
  );
}

export function VoiceDoc() {
  const [persona, setPersona] = useState<VoicePersona>('demon');
  const [text, setText] = useState(SAMPLE_TEXT);
  const [voiceName, setVoiceName] = useState('');
  const [adaptToTime, setAdaptToTime] = useState(true);
  const [hour] = useState(() => new Date().getHours());

  const speech = useSpookySpeech();
  const mic = useMediaStream({ audio: true });

  // Only the hour, and only on this page. Nothing is stored or sent.
  const context = adaptToTime ? { hour } : undefined;
  const echo = useVoiceEcho({ stream: mic.stream, persona, context });

  const status = ECHO_STATUS[echo.state];
  const problem = mic.error ?? echo.error;

  const codeSnippet = `import { useMediaStream, useSpookySpeech, useVoiceEcho } from 'groove-ui';

// Speak text with a voice installed on the device.
const speech = useSpookySpeech();
speech.speak('Do not look behind you.', { persona: '${persona}' });

// Say something and hear it back in another voice.
const mic = useMediaStream({ audio: true });
const echo = useVoiceEcho({ stream: mic.stream, persona: '${persona}' });

<button onClick={mic.start}>Start listening</button>
{echo.clip && (
  <>
    <audio src={echo.clip.url} controls />
    <button onClick={echo.keep}>Keep it</button>
    <button onClick={echo.discard}>Let it go</button>
  </>
)}

// Drive a character's mouth with echo.outputLevel (0-1).`;

  return (
    <ComponentDocPage
      title="Voice"
      category="The Effects"
      description="A voice toolkit for talking characters, built only on what the browser already has. Speak text aloud in a persona, or say something and hear it back as a demon, ghost, imp, dead radio, or possessed voice. Clips stay in memory and are only saved if the user keeps them."
      packageName="voice"
      gothicPhilosophy={{
        influence: 'Seances, Dead Radios & Talking Pets',
        movement: 'Echoes, Slowed Voices & Whispers Returned',
      }}
      preview={
        <div className="w-full max-w-4xl space-y-6">
          {/* One voice for both demos. */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-emerald-400/80">Voice</h3>
              <button type="button" aria-pressed={adaptToTime} onClick={() => setAdaptToTime(!adaptToTime)} className={chip(adaptToTime)}>
                Darker at night
              </button>
            </div>
            <div role="group" aria-label="Voice" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VOICE_PERSONAS.map((name) => {
                const active = persona === name;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPersona(name)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? 'border-emerald-600/80 bg-emerald-950/60'
                        : 'border-[#1b3a2a] bg-[#102219]/60 hover:border-emerald-800'
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${active ? 'text-emerald-200' : 'text-stone-200'}`}>
                      {PERSONAS[name].label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-stone-400">{PERSONAS[name].description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Text to speech */}
            <section className={panelClass} aria-label="Speak text">
              <PanelHeading title="Speak text" hint="Uses a voice installed on this device. Live only, it cannot be saved." />
              {speech.supported ? (
                <>
                  <Field label="Text">
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      value={text}
                      maxLength={MAX_TEXT_LENGTH}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </Field>
                  <Field label="Device voice">
                    <select className={selectClass} value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
                      <option value="">Best match</option>
                      {speech.voices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.name}>{voice.name} ({voice.lang})</option>
                      ))}
                    </select>
                  </Field>
                  <div className="mt-auto flex items-center gap-3">
                    {speech.speaking ? (
                      <Button size="sm" variant="secondary" onClick={speech.cancel}>Stop</Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="gothic"
                        disabled={!text.trim()}
                        onClick={() => void speech.speak(text, { persona, voice: voiceName || undefined, context })}
                      >
                        Speak
                      </Button>
                    )}
                    <p role="status" className="text-xs text-stone-400">{speech.speaking ? 'Speaking...' : ''}</p>
                  </div>
                </>
              ) : (
                <p role="status" className="text-sm text-red-400">This browser cannot speak text aloud.</p>
              )}
            </section>

            {/* Voice echo */}
            <section className={panelClass} aria-label="Talk back">
              <PanelHeading title="Talk back" hint="Say something, pause, and hear it back. Headphones work best." />
              {echo.supported ? (
                <>
                  <div className="flex items-center gap-3">
                    {mic.status === 'active' ? (
                      <Button size="sm" variant="secondary" onClick={mic.stop}>Stop listening</Button>
                    ) : (
                      <Button size="sm" variant="gothic" disabled={mic.status === 'requesting'} onClick={() => void mic.start()}>
                        {mic.status === 'requesting' ? 'Waiting for permission...' : 'Start listening'}
                      </Button>
                    )}
                    <p role="status" className={`flex items-center gap-2 text-xs ${problem ? 'text-red-400' : 'text-stone-300'}`}>
                      {!problem && <span aria-hidden="true" className={`h-2 w-2 rounded-full ${status.dot}`} />}
                      {problem ?? status.label}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Meter label="You" level={echo.level} tone="bg-emerald-500" />
                    <Meter label={PERSONAS[persona].label} level={echo.outputLevel} tone="bg-red-500" />
                  </div>

                  {echo.clip ? (
                    <div className="space-y-3 rounded-xl border border-[#1b3a2a] bg-[#102219]/40 p-3">
                      <p className="text-xs text-stone-300">
                        {echo.clip.label}, {(echo.clip.durationMs / 1000).toFixed(1)}s. Held in this tab only.
                      </p>
                      <audio controls src={echo.clip.url} className="h-9 w-full" />
                      <div className="flex flex-wrap items-end gap-2">
                        <Button size="sm" variant="gothic" onClick={echo.keep}>Keep it</Button>
                        <Button size="sm" variant="ghost" onClick={echo.discard}>Let it go</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-auto text-xs text-stone-500">Your last phrase appears here. Nothing is saved unless you keep it.</p>
                  )}
                </>
              ) : (
                <p role="status" className="text-sm text-red-400">
                  This browser cannot record and change voices here. It needs a secure (https) page, a microphone, and
                  support for recording and offline audio.
                </p>
              )}
            </section>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'useSpookySpeech()', type: '{ supported, voices, speaking, speak, cancel }', default: '—', description: 'Speaks text with an installed voice, shaped by a persona. Long text is split so browsers do not cut it off' },
        { name: 'speak(text, options)', type: '{ persona, voice, lang, context, volume }', default: "{ persona: 'natural' }", description: 'Starts speaking. A new call stops the last. Resolves when finished or stopped' },
        { name: 'useVoiceEcho({ stream })', type: '{ state, level, outputLevel, clip, replay, keep, discard, error }', default: '—', description: 'Records a phrase, changes the voice, and plays it back. The microphone is ignored while it plays' },
        { name: 'persona', type: "'natural' | 'demon' | 'ghost' | 'imp' | 'radio' | 'possessed'", default: "'demon'", description: 'How the voice sounds' },
        { name: 'context', type: '{ hour?, loudness?, visits? }', default: '—', description: 'Coarse values the voice may adapt to: deeper at night, grittier when loud, more echo for repeat visitors' },
        { name: 'gate', type: '{ startLevel, endLevel, silenceMs, minMs, maxMs }', default: '—', description: 'When a phrase starts and ends. Tune for noisy rooms' },
        { name: 'outputLevel', type: 'number (0-1)', default: '0', description: 'Loudness of the changed voice while it plays. Use it to move a mouth' },
        { name: 'useKeepsake()', type: '{ item, hold, keep, discard }', default: '—', description: 'Holds one clip in memory. keep() downloads it. Nothing else leaves the tab' },
        { name: 'Building blocks', type: 'functions', default: '—', description: 'PERSONAS, adaptPersona(), pickVoice(), chunkText(), createUtteranceGate(), renderPersona()' },
      ]}
      prevPage={{ title: 'SurveillanceCam', path: '/docs/components/surveillance-cam' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
