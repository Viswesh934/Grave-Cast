import { useEffect, useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Field, Section } from '../../components/docs/DocControls';
import { chip, inputClass, selectClass } from '../../components/docs/docStyles';
import { useDemoFeed } from '../../hooks/useDemoFeed';
import {
  ASCII_ART_NAMES,
  AsciiArt,
  AsciiBanner,
  AsciiVideo,
  Button,
  PHOSPHOR_THEME_NAMES,
  RAMP_NAMES,
  useMediaStream,
  type AsciiArtName,
  type PhosphorTheme,
  type RampName,
} from 'groove-ui';

type VideoSource = 'demo' | 'camera';

export function AsciiDoc() {
  const [art, setArt] = useState<AsciiArtName>('skull');
  const [theme, setTheme] = useState<PhosphorTheme>('amber');
  const [typing, setTyping] = useState(true);
  const [reveal, setReveal] = useState(true);
  const [flicker, setFlicker] = useState(false);
  const [replay, setReplay] = useState(0);

  const [bannerText, setBannerText] = useState('Rest in peace');

  const [source, setSource] = useState<VideoSource>('demo');
  const [ramp, setRamp] = useState<RampName>('standard');
  const [cols, setCols] = useState(72);
  const demo = useDemoFeed(source === 'demo');
  const camera = useMediaStream({ video: { width: 640, height: 480, facingMode: 'user' } });

  // Turn the camera off when switching away from it.
  useEffect(() => {
    if (source !== 'camera') camera.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const stream = source === 'demo' ? demo : camera.stream;

  const codeSnippet = `import { AsciiArt, AsciiBanner, AsciiVideo, useMediaStream } from 'groove-ui';

// 1. Built-in art with a phosphor glow, typing, and hover runes.
<AsciiArt art="${art}" theme="${theme}"${typing ? ' typing' : ''}${reveal ? ' reveal' : ''}${flicker ? ' flicker' : ''} label="A ${art}" />

// 2. Your own art. Any multi-line string works.
<AsciiArt art={\`  /\\\\_/\\\\\\n ( o.o )\\n  > ^ <\`} theme="matrix" label="A cat" />

// 3. Big block letters. The label is the text, so screen readers read the words.
<AsciiBanner text="${bannerText}" theme="${theme}" maxCols={60} />

// 4. A live picture as text. Nothing is recorded or sent anywhere.
const { stream, start } = useMediaStream({ video: true });
<AsciiVideo stream={stream} cols={${cols}} ramp="${ramp}" mirror theme="${theme}" />`;

  return (
    <ComponentDocPage
      title="ASCII"
      category="The Effects"
      description="Text turned into pictures. Hand-drawn art with phosphor glow, typing, and runes that rise under the pointer. Big block-letter banners. And live video or webcam drawn as moving text. The conversion is a small set of pure functions you can use on their own."
      packageName="ascii"
      gothicPhilosophy={{
        influence: 'Terminals, Occult Sigils & Old Phosphor Monitors',
        movement: 'Typed Reveals & Shifting Runes',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Theme">
              <select className={selectClass} value={theme} onChange={(e) => setTheme(e.target.value as PhosphorTheme)}>
                {PHOSPHOR_THEME_NAMES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Section title="ASCII art">
            <div className="flex flex-wrap gap-2">
              {ASCII_ART_NAMES.map((name) => (
                <button key={name} type="button" aria-pressed={art === name} onClick={() => setArt(name)} className={chip(art === name)}>
                  {name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={typing} onClick={() => setTyping(!typing)} className={chip(typing)}>Typing: {typing ? 'ON' : 'OFF'}</button>
              <button type="button" aria-pressed={reveal} onClick={() => setReveal(!reveal)} className={chip(reveal)}>Hover runes: {reveal ? 'ON' : 'OFF'}</button>
              <button type="button" aria-pressed={flicker} onClick={() => setFlicker(!flicker)} className={chip(flicker)}>Flicker: {flicker ? 'ON' : 'OFF'}</button>
              <button type="button" onClick={() => setReplay((n) => n + 1)} className={chip(false)}>Replay</button>
            </div>
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[#183425] bg-[#05070a] p-6">
              <AsciiArt
                key={`${art}-${replay}`}
                art={art}
                theme={theme}
                size="xl"
                typing={typing}
                reveal={reveal}
                flicker={flicker}
                label={`A ${art}`}
              />
            </div>
            {reveal && <p className="text-center text-xs text-stone-400">Move your pointer over the art.</p>}
          </Section>

          <Section title="Banner">
            <Field label="Text">
              <input className={inputClass} value={bannerText} maxLength={24} onChange={(e) => setBannerText(e.target.value)} />
            </Field>
            <div className="overflow-x-auto rounded-2xl border border-[#183425] bg-[#05070a] p-6">
              <AsciiBanner text={bannerText || ' '} theme={theme} maxCols={64} size="md" typing={false} />
            </div>
          </Section>

          <Section title="Live picture as text">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Source">
                <select className={selectClass} value={source} onChange={(e) => setSource(e.target.value as VideoSource)}>
                  <option value="demo">Demo feed</option>
                  <option value="camera">My camera</option>
                </select>
              </Field>
              <Field label="Characters">
                <select className={selectClass} value={ramp} onChange={(e) => setRamp(e.target.value as RampName)}>
                  {RAMP_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </Field>
              <Field label={`Width: ${cols}`}>
                <input type="range" min={32} max={120} step={4} value={cols} onChange={(e) => setCols(Number(e.target.value))} className="w-full cursor-pointer accent-emerald-500" />
              </Field>
            </div>

            {source === 'camera' && (
              <div className="flex flex-wrap items-center gap-3">
                {camera.status === 'active' ? (
                  <Button size="sm" variant="secondary" onClick={camera.stop}>Turn camera off</Button>
                ) : (
                  <Button size="sm" variant="gothic" disabled={camera.status === 'requesting'} onClick={() => void camera.start()}>
                    {camera.status === 'requesting' ? 'Waiting for permission...' : 'Turn camera on'}
                  </Button>
                )}
                <p role="status" className={`text-xs ${camera.error ? 'text-red-400' : 'text-stone-400'}`}>
                  {camera.error ?? (camera.status === 'active' ? 'Camera is on. Nothing is recorded or sent.' : 'Camera is off.')}
                </p>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-[#183425] bg-[#05070a] p-4">
              <AsciiVideo
                stream={stream}
                cols={cols}
                ramp={ramp}
                mirror={source === 'camera'}
                theme={theme}
                size="sm"
                label={source === 'camera' ? 'Your camera drawn as text' : 'A dim hallway drawn as text'}
              />
            </div>
          </Section>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: '<AsciiArt> art', type: 'AsciiArtName | string', default: '—', description: 'A built-in name (skull, coffin, bat, candle, headstone, ghost, cross, spider) or your own multi-line art' },
        { name: '<AsciiArt> typing', type: 'boolean', default: 'false', description: 'Type the art out in reading order. Spaces are free, so padding never pauses' },
        { name: '<AsciiArt> typeSpeed', type: 'number', default: '240', description: 'Characters per second while typing' },
        { name: '<AsciiArt> reveal', type: 'boolean', default: 'false', description: 'Turn characters near the pointer into runes that shimmer and settle back' },
        { name: '<AsciiBanner> text', type: 'string', default: '—', description: 'Words to draw in big block letters. The label is the text itself' },
        { name: '<AsciiBanner> maxCols', type: 'number', default: '—', description: 'Wrap onto more rows past this many characters. Words are never split' },
        { name: '<AsciiVideo> stream', type: 'MediaStream | null', default: 'null', description: 'A live stream. Pair with useMediaStream, or use src for a video file' },
        { name: '<AsciiVideo> cols / fps', type: 'number', default: '80 / 12', description: 'Characters across, and redraws per second' },
        { name: '<AsciiVideo> ramp', type: "'standard' | 'detailed' | 'blocks' | 'minimal' | 'binary' | string", default: "'standard'", description: 'Characters from dark to bright, or your own' },
        { name: '<AsciiVideo> mirror', type: 'boolean', default: 'false', description: 'Flip left to right, like a mirror' },
        { name: 'theme', type: "'amber' | 'blood' | 'matrix' | 'ghost' | 'bone'", default: "'amber'", description: 'Phosphor color theme (all components)' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Text size (all components)' },
        { name: 'glow / flicker', type: 'boolean', default: 'true / false', description: 'Glow around the text, and an old-monitor flicker (off for reduced motion)' },
        { name: 'label / decorative', type: 'string / boolean', default: "'ASCII art' / false", description: 'Accessible description, or hide the art from screen readers entirely' },
      ]}
      prevPage={{ title: 'SoundTrigger', path: '/docs/components/sound-trigger' }}
      nextPage={{ title: 'SurveillanceCam', path: '/docs/components/surveillance-cam' }}
    />
  );
}
