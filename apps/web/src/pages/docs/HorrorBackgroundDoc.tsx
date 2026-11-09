import { useEffect, useRef, useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  ClickToBegin,
  HorrorBackground,
  useSpookyMusic,
  type HorrorBackgroundVariant,
  type VoiceHandle,
} from 'groove-ui';

type Intensity = 'ghastly' | 'cursed' | 'abyssal';

const VARIANTS: { id: HorrorBackgroundVariant; label: string; blurb: string }[] = [
  { id: 'fog', label: 'Fog', blurb: 'Slow banks of mist' },
  { id: 'storm', label: 'Storm', blurb: 'Rain and lightning' },
  { id: 'ritual-circle', label: 'Ritual Circle', blurb: 'A turning summoning circle' },
  { id: 'blizzard', label: 'Blizzard', blurb: 'Wind-blown snow' },
  { id: 'candlelit', label: 'Candlelit', blurb: 'Vignette with flickering glow' },
  { id: 'hypnotic', label: 'Hypnotic', blurb: 'A slow tunnel of spokes and rings' },
];

const INTENSITIES: Intensity[] = ['ghastly', 'cursed', 'abyssal'];

const chip = (active: boolean) =>
  `px-3 py-1.5 text-xs rounded-xl font-mono transition-all cursor-pointer border ${
    active
      ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600/80 font-bold'
      : 'bg-[#102219] text-stone-300 border-[#1b3a2a] hover:text-white'
  }`;

export function HorrorBackgroundDoc() {
  const [variant, setVariant] = useState<HorrorBackgroundVariant>('storm');
  const [intensity, setIntensity] = useState<Intensity>('cursed');
  const [paused, setPaused] = useState(false);
  const [promptKey, setPromptKey] = useState(0);

  // The hypnotic scene brings its own sound, started by the one-time click.
  const music = useSpookyMusic({ scale: 'marwa', tonic: 'D3' });
  const droneRef = useRef<VoiceHandle | null>(null);

  const stopDrone = () => {
    droneRef.current?.stop();
    droneRef.current = null;
  };

  useEffect(() => {
    if (variant !== 'hypnotic') stopDrone();
  }, [variant]);

  useEffect(() => stopDrone, []);

  const showAgain = () => {
    stopDrone();
    setPromptKey((key) => key + 1);
  };

  const hypnotic = variant === 'hypnotic';

  const codeSnippet = hypnotic
    ? `import { HorrorBackground, ClickToBegin, useSpookyMusic } from 'groove-ui';

const music = useSpookyMusic({ scale: 'marwa', tonic: 'D3' });

<section style={{ position: 'relative', isolation: 'isolate' }}>
  <HorrorBackground variant="hypnotic" intensity="${intensity}"${paused ? ' paused' : ''} />

  {/* One click wakes the audio, plays a sound, and starts the drone.
      Then the prompt fades out and is gone for good. */}
  <ClickToBegin
    sound="portalOpen"
    onBegin={() => music.drone()}
  />
</section>`
    : `import { HorrorBackground } from 'groove-ui';

// Put it inside any container. The container needs
// \`position: relative\` and \`isolation: isolate\` so the
// backdrop sits behind your content.
<section style={{ position: 'relative', isolation: 'isolate' }}>
  <HorrorBackground variant="${variant}" intensity="${intensity}"${paused ? ' paused' : ''} />
  <h1>Your content stays clickable</h1>
</section>

// Or cover the whole page.
<HorrorBackground variant="${variant}" fixed />

// Stack the layers yourself for a custom scene.
import { FogLayers, CandlelitLayers } from 'groove-ui';`;

  return (
    <ComponentDocPage
      title="HorrorBackground"
      category="The Effects"
      description="Atmospheric backdrops that never get in the way: fog, storm, a ritual circle, a blizzard, candlelight, and a hypnotic tunnel. They ignore pointer events, hide from screen readers, and stop moving for anyone who prefers reduced motion. Built from CSS and SVG, with one canvas for the snow. Pair the hypnotic one with ClickToBegin to start its sound."
      packageName="horror-background"
      preview={
        <div className="w-full max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                title={v.blurb}
                aria-pressed={variant === v.id}
                onClick={() => setVariant(v.id)}
                className={chip(variant === v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="relative isolate h-[420px] overflow-hidden rounded-2xl border border-[#183425] bg-[#05070a]">
            <HorrorBackground variant={variant} intensity={intensity} paused={paused} />

            {hypnotic && (
              <ClickToBegin
                key={promptKey}
                sound="portalOpen"
                onBegin={() => {
                  droneRef.current = music.drone();
                }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {INTENSITIES.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={intensity === level}
                onClick={() => setIntensity(level)}
                className={chip(intensity === level)}
              >
                {level}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
              className={chip(paused)}
            >
              Paused: {paused ? 'ON' : 'OFF'}
            </button>
            {hypnotic && (
              <button type="button" onClick={showAgain} className={chip(false)}>
                Show the prompt again
              </button>
            )}
          </div>

          {hypnotic && (
            <p className="text-center text-xs text-stone-400">
              Swirling motion can bother some people. This one is slow and low in contrast, and it stops
              completely when your system asks for reduced motion. Use Paused to freeze it.
            </p>
          )}
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'variant', type: "'fog' | 'storm' | 'ritual-circle' | 'blizzard' | 'candlelit' | 'hypnotic'", default: "'fog'", description: 'Which backdrop to draw' },
        { name: 'intensity', type: "'ghastly' | 'cursed' | 'abyssal'", default: "'cursed'", description: 'Opacity, animation speed, and snow density' },
        { name: 'fixed', type: 'boolean', default: 'false', description: 'Cover the whole viewport instead of the nearest positioned parent' },
        { name: 'paused', type: 'boolean', default: 'false', description: 'Freeze all motion. Reduced-motion users get this automatically' },
        { name: 'accent', type: 'string', default: '—', description: 'Color of the ritual circle. Ignored by other variants' },
        { name: 'zIndex', type: 'number', default: '-1', description: 'Stacking order. The default sits behind the parent content' },
        { name: 'className', type: 'string', default: "''", description: 'Extra class for the backdrop' },
        { name: 'style', type: 'CSSProperties', default: '—', description: 'Inline styles for the backdrop' },
        { name: '<ClickToBegin> label', type: 'string', default: "'Click to begin'", description: 'Main text of the one-time prompt' },
        { name: '<ClickToBegin> hint', type: 'string', default: "'Sound will play'", description: 'Smaller line under the label. Empty string hides it' },
        { name: '<ClickToBegin> sound', type: 'SpookySound', default: '—', description: 'Sound effect played on the click' },
        { name: '<ClickToBegin> enableAudio', type: 'boolean', default: 'true', description: 'Turn the global audio switch on when clicked (needs AudioProvider)' },
        { name: '<ClickToBegin> onBegin', type: '() => void', default: '—', description: 'Runs once on the click. Start your music or animation here' },
        { name: '<ClickToBegin> fixed', type: 'boolean', default: 'false', description: 'Cover the whole viewport instead of the parent' },
      ]}
      prevPage={{ title: 'SoundLibrary', path: '/docs/components/sound-library' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
