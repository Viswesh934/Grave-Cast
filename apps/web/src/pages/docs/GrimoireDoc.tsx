import { Link } from 'react-router-dom';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { SupportChips } from '../../components/docs/grimoire/SupportChips';
import { RITE_FAMILIES, RiteSigil, grimoireAccents, type RiteFamily } from 'groove-ui';
import { documentedRites, firstRitePage, ritePath } from './grimoire/paths';

const FAMILY_ORDER: RiteFamily[] = ['seeing', 'watching', 'keeping', 'binding'];

function RiteCatalog() {
  return (
    <div className="w-full max-w-5xl space-y-10">
      {FAMILY_ORDER.map((family) => {
        const rites = documentedRites.filter((rite) => rite.family === family);
        if (rites.length === 0) return null;
        const headingId = `grimoire-family-${family}`;
        return (
          <section key={family} aria-labelledby={headingId} className="space-y-4">
            <div>
              <h3 id={headingId} className="m-0 font-serif text-xl font-bold text-[#ece2cc]">
                {RITE_FAMILIES[family].label}
              </h3>
              <p className="m-0 mt-1 text-sm text-stone-400">{RITE_FAMILIES[family].description}</p>
            </div>
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
              {rites.map((rite) => {
                const accent = grimoireAccents[rite.accent];
                return (
                  <li key={rite.id}>
                    <Link
                      to={ritePath(rite.id)}
                      className="group flex h-full flex-col gap-4 rounded-2xl border border-[#3a3047] bg-[#13111a] p-5 no-underline transition-colors hover:border-[color:var(--rite-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--rite-accent)]"
                      style={{ ['--rite-accent' as string]: accent }}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border"
                          style={{ color: accent, borderColor: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
                        >
                          <RiteSigil glyph={rite.sigil} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="m-0 font-serif text-lg font-bold text-[#ece2cc]">
                            {rite.name}
                            <span aria-hidden="true" className="ml-2 inline-block text-stone-500 transition-transform group-hover:translate-x-1">→</span>
                          </h4>
                          <p className="m-0 mt-1 text-sm leading-relaxed text-[#c2c5d4]">{rite.tagline}</p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <SupportChips support={rite.support} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

const codeSnippet = `import { RiteShell, defineCapability, useRite } from 'groove-ui/grimoire';

// Say what the rite needs from the browser.
const wakeLock = defineCapability({
  id: 'wake-lock',
  label: 'Screen Wake Lock',
  secure: true,
  detect: () => 'wakeLock' in navigator,
});

function KeepAwake() {
  // A safe start and stop, with plain-language errors.
  const vigil = useRite(wakeLock, {
    start: async ({ end }) => {
      const lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => end('The screen may sleep again.'));
      return lock;
    },
    stop: (lock) => lock.release(),
  });

  // The frame every rite lives in: name, mark, status, start and stop, errors.
  return <RiteShell name="Vigil" sigil="candle" accent="candle" rite={vigil} />;
}`;

export function GrimoireDoc() {
  return (
    <ComponentDocPage
      title="Grimoire"
      category="The Grimoire"
      description="Your browser can already inspect pages, read colors, store things, talk between tabs, and much more. Grimoire turns those powers into small, haunted tools you can drop into any page. Each one waits until it is asked, explains itself when it cannot work, and can always be undone. Pick a rite to try it."
      packageName="grimoire"
      preview={<RiteCatalog />}
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'RiteShell', type: 'component', default: '—', description: 'The frame every rite lives in: name, mark, status, start and stop, errors, and your content' },
        { name: 'useRite(capability, { start, stop })', type: 'hook', default: '—', description: 'Starts and stops one browser power safely. Explains in plain words when it is blocked or unavailable' },
        { name: 'defineCapability({ id, label, detect })', type: 'function', default: '—', description: 'Says what a rite needs. Checked once, safely, even during server rendering' },
        { name: 'defineRite(spec) · grimoireRites', type: 'function · list', default: '—', description: 'Describe a rite once: name, mark, color, family, and browser support. Every rite is listed in grimoireRites' },
        { name: 'RiteSection · RiteStat · RiteLog · RiteInput · RiteSlider · RiteSegmented · RiteEmpty', type: 'components', default: '—', description: 'The parts rite panels are made from, so every rite looks and works the same' },
        { name: 'RiteLayer · RiteHighlight · RiteLabel', type: 'components', default: '—', description: 'Draw over the page. Clicks pass through, and labels move so they never cover what they describe' },
        { name: 'accent', type: "'witchfire' | 'ectoplasm' | 'blood' | 'candle' | 'moonlight' | 'soulfire' | 'ember' | 'bone'", default: "'witchfire'", description: 'The color a rite is lit by' },
      ]}
      prevPage={{ title: 'Voice', path: '/docs/components/voice' }}
      nextPage={firstRitePage()}
    />
  );
}
