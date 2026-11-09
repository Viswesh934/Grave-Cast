/**
 * The sound effect catalog.
 *
 * Every effect is a short recipe of tone and noise layers. To add a sound,
 * add an entry to `EFFECT_SPECS`; the name, duration, list, and search all
 * pick it up automatically.
 *
 * @module audio/effects/catalog
 */

import type {
  EffectCategory,
  EffectDefinition,
  EffectLayer,
  EffectSpec,
  LayerFilter,
  NoiseColor,
  Sweep,
  ToneWave,
} from './types';

// ---------------------------------------------------------------------------
// Recipe helpers
// ---------------------------------------------------------------------------

const tone = (
  source: ToneWave,
  freq: Sweep,
  length: number,
  extra: Partial<EffectLayer> = {}
): EffectLayer => ({ source, freq, length, ...extra });

const noise = (
  color: NoiseColor,
  length: number,
  filter?: LayerFilter,
  extra: Partial<EffectLayer> = {}
): EffectLayer => ({ source: color, length, filter, ...extra });

const lowpass = (freq: Sweep, q?: number): LayerFilter => ({ type: 'lowpass', freq, q });
const highpass = (freq: Sweep, q?: number): LayerFilter => ({ type: 'highpass', freq, q });
const bandpass = (freq: Sweep, q?: number): LayerFilter => ({ type: 'bandpass', freq, q });

/** Bell partials as [pitch ratio, loudness, life as a fraction of the length]. */
const BELL_PARTIALS: readonly (readonly [number, number, number])[] = [
  [1, 1, 1],
  [2, 0.6, 0.75],
  [2.42, 0.4, 0.6],
  [3, 0.3, 0.5],
  [4.2, 0.2, 0.35],
];

/** A struck bell: a fundamental plus inharmonic partials that die away at different speeds. */
const bell = (hz: number, length: number): EffectLayer[] =>
  BELL_PARTIALS.map(([ratio, level, life]) =>
    tone('sine', hz * ratio, length * life, { gain: level, attack: 0.003 })
  );

const define = <K extends string>(specs: Record<K, EffectSpec>): Record<K, EffectSpec> => specs;

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

/**
 * Every built-in sound effect, grouped by category.
 */
export const EFFECT_SPECS = define({
  // --- Taps & Clicks -------------------------------------------------------
  boneClick: {
    label: 'Bone Click',
    category: 'taps',
    description: 'A dry, sharp snap, like a knuckle on a skull.',
    layers: [noise('white', 0.05, highpass(1000), { gain: 0.8 })],
  },
  stoneTap: {
    label: 'Stone Tap',
    category: 'taps',
    description: 'A short knock on a cold slab.',
    layers: [tone('sine', [180, 90], 0.12, { gain: 0.9 }), noise('brown', 0.06, lowpass(600), { gain: 0.6 })],
  },
  woodKnock: {
    label: 'Knock Knock',
    category: 'taps',
    description: 'Two knocks at the door. Nobody is there.',
    layers: [
      tone('triangle', [320, 200], 0.09, { repeat: { count: 2, interval: 0.16 } }),
      noise('white', 0.04, bandpass(900, 3), { gain: 0.7, repeat: { count: 2, interval: 0.16 } }),
    ],
  },
  tick: {
    label: 'Tick',
    category: 'taps',
    description: 'A tiny, precise click for fast feedback.',
    layers: [tone('square', 1800, 0.02, { gain: 0.4 })],
  },
  wispBlip: {
    label: 'Wisp Blip',
    category: 'taps',
    description: 'A soft rising blip for selecting something.',
    layers: [tone('sine', [660, 990], 0.12, { gain: 0.8 }), tone('sine', 1320, 0.1, { start: 0.06, gain: 0.4 })],
  },
  hollowDenied: {
    label: 'Hollow Denied',
    category: 'taps',
    description: 'A low, dull falling tone for a refused action.',
    layers: [tone('square', [220, 110], 0.2, { gain: 0.7, filter: lowpass(900) })],
  },
  hoverWhisper: {
    label: 'Hover Whisper',
    category: 'taps',
    description: 'A faint breath of air as you pass over something.',
    layers: [noise('pink', 0.25, bandpass([2500, 3500], 2), { gain: 0.5, shape: 'swell' })],
  },

  // --- Doors & Locks -------------------------------------------------------
  coffinCreak: {
    label: 'Coffin Creak',
    category: 'doors',
    description: 'A lid easing open on dry hinges.',
    layers: [
      tone('square', [200, 100], 0.5, { gain: 0.6, filter: lowpass(1200), vibrato: { rate: 24, depth: 50 } }),
      noise('brown', 0.45, bandpass(300, 2), { gain: 0.25, shape: 'swell' }),
    ],
  },
  doorCreak: {
    label: 'Door Creak',
    category: 'doors',
    description: 'A long, slow groan from an old hinge.',
    layers: [
      tone('sawtooth', [120, 260], 1.3, {
        gain: 0.5,
        shape: 'swell',
        filter: bandpass([400, 900], 8),
        vibrato: { rate: 16, depth: 80 },
      }),
    ],
  },
  gateSlam: {
    label: 'Gate Slam',
    category: 'doors',
    description: 'Iron meets stone. The echo takes a moment.',
    layers: [
      noise('brown', 0.5, lowpass([800, 200]), { gain: 1 }),
      tone('sine', [90, 40], 0.45, { gain: 0.9 }),
      noise('white', 0.08, highpass(2000), { gain: 0.5 }),
    ],
  },
  lockClick: {
    label: 'Lock Click',
    category: 'doors',
    description: 'A key turns, and the bolt gives way.',
    layers: [
      noise('white', 0.02, highpass(2500), { gain: 0.9 }),
      noise('white', 0.025, highpass(1800), { start: 0.09, gain: 0.7 }),
      tone('square', 900, 0.015, { start: 0.09, gain: 0.3 }),
    ],
  },
  chainRattle: {
    label: 'Chain Rattle',
    category: 'doors',
    description: 'Loose links shaking in the dark.',
    layers: [
      noise('white', 0.05, bandpass(4000, 6), {
        gain: 0.7,
        repeat: { count: 9, interval: 0.05, jitter: 0.5, fade: 0.93, pitchJitter: 0.2 },
      }),
      tone('triangle', [2400, 1800], 0.04, {
        gain: 0.3,
        repeat: { count: 9, interval: 0.05, jitter: 0.5, fade: 0.93, pitchJitter: 0.15 },
      }),
    ],
  },
  latchBolt: {
    label: 'Latch Bolt',
    category: 'doors',
    description: 'A heavy bolt sliding home, then a second one.',
    layers: [
      noise('brown', 0.06, lowpass(500), { gain: 0.8 }),
      tone('square', [150, 80], 0.08, { gain: 0.5, filter: lowpass(700) }),
      noise('white', 0.03, highpass(1500), { start: 0.12, gain: 0.6 }),
      tone('square', [220, 120], 0.06, { start: 0.12, gain: 0.4, filter: lowpass(900) }),
    ],
  },

  // --- Impacts & Thuds -----------------------------------------------------
  stoneGrind: {
    label: 'Stone Grind',
    category: 'impacts',
    description: 'Rock dragging over rock.',
    layers: [noise('brown', 0.3, bandpass(400, 1), { gain: 1.2 })],
  },
  boneCrack: {
    label: 'Bone Crack',
    category: 'impacts',
    description: 'A sharp snap with a hollow ring.',
    layers: [
      noise('white', 0.03, highpass(1500), { gain: 1 }),
      tone('triangle', [900, 300], 0.08, { gain: 0.5 }),
      noise('white', 0.1, bandpass(2500, 4), { start: 0.03, gain: 0.4 }),
    ],
  },
  stoneDrop: {
    label: 'Stone Drop',
    category: 'impacts',
    description: 'A heavy block hitting the floor.',
    layers: [
      tone('sine', [140, 45], 0.35, { gain: 1 }),
      noise('brown', 0.3, lowpass(500), { gain: 0.8 }),
      noise('white', 0.02, highpass(3000), { gain: 0.5 }),
    ],
  },
  gravelCrunch: {
    label: 'Gravel Crunch',
    category: 'impacts',
    description: 'Footsteps on a cemetery path.',
    layers: [
      noise('white', 0.04, bandpass(1800, 1), {
        gain: 0.8,
        repeat: { count: 7, interval: 0.05, jitter: 0.6, fade: 0.85, pitchJitter: 0.3 },
      }),
    ],
  },
  shovelScrape: {
    label: 'Shovel Scrape',
    category: 'impacts',
    description: 'Steel dragging through grave dirt.',
    layers: [
      noise('brown', 0.28, lowpass([1200, 300]), { gain: 0.9, shape: 'swell' }),
      noise('white', 0.05, highpass(2500), { start: 0.2, gain: 0.4 }),
    ],
  },
  woodSplinter: {
    label: 'Wood Splinter',
    category: 'impacts',
    description: 'Planks giving way in a rattle of cracks.',
    layers: [
      noise('white', 0.02, highpass(1200), {
        repeat: { count: 5, interval: 0.025, jitter: 0.8, fade: 0.9 },
      }),
      tone('sawtooth', [700, 200], 0.15, { gain: 0.3, filter: lowpass(1500) }),
    ],
  },
  thud: {
    label: 'Thud',
    category: 'impacts',
    description: 'A dull, heavy hit.',
    layers: [tone('sine', [110, 38], 0.3, { gain: 1 }), noise('brown', 0.15, lowpass(300), { gain: 0.8 })],
  },

  // --- Spells & Potions ----------------------------------------------------
  cauldronBubble: {
    label: 'Cauldron Bubble',
    category: 'magic',
    description: 'A single thick bubble breaking the surface.',
    layers: [
      tone('sine', [100, 300], 0.1, { gain: 1.5, filter: bandpass(200, 10) }),
      tone('sine', [300, 80], 0.3, { start: 0.1, gain: 1.5, filter: bandpass(200, 10) }),
    ],
  },
  cauldronBoil: {
    label: 'Cauldron Boil',
    category: 'magic',
    description: 'A slow simmer with bubbles breaking the surface.',
    layers: [
      noise('pink', 1.6, lowpass(700, 0.7), { gain: 0.35, shape: 'hold' }),
      tone('sine', [220, 520], 0.09, {
        gain: 0.5,
        filter: bandpass(500, 4),
        repeat: { count: 10, interval: 0.14, jitter: 0.9, fade: 0.93, pitchJitter: 0.35 },
      }),
    ],
  },
  spellCast: {
    label: 'Spell Cast',
    category: 'magic',
    description: 'Power gathers, then bursts into sparkle.',
    layers: [
      tone('sawtooth', [200, 1600], 0.6, { gain: 0.5, shape: 'swell', filter: lowpass([400, 5000], 4) }),
      tone('sine', [1600, 3200], 0.2, { start: 0.5, gain: 0.4 }),
      noise('white', 0.3, highpass(5000), { start: 0.5, gain: 0.25 }),
    ],
  },
  portalOpen: {
    label: 'Portal Open',
    category: 'magic',
    description: 'A rift tears open with a rising, warped hum.',
    layers: [
      tone('sawtooth', [60, 240], 1.4, {
        gain: 0.5,
        shape: 'swell',
        filter: lowpass([300, 2500], 2),
        fm: { ratio: 0.5, depth: 0.8 },
      }),
      noise('pink', 1.4, bandpass([300, 2000], 1), { gain: 0.4, shape: 'swell' }),
    ],
  },
  enchantChime: {
    label: 'Enchant Chime',
    category: 'magic',
    description: 'Three bright notes shimmer upward.',
    layers: [
      tone('sine', 880, 0.9, { gain: 0.5, fm: { ratio: 2, depth: 0.3 } }),
      tone('sine', 1109, 0.9, { start: 0.1, gain: 0.5, fm: { ratio: 2, depth: 0.3 } }),
      tone('sine', 1319, 1, { start: 0.2, gain: 0.5, fm: { ratio: 2, depth: 0.3 } }),
    ],
  },
  curse: {
    label: 'Curse',
    category: 'magic',
    description: 'Two clashing notes beat against each other.',
    layers: [
      tone('sawtooth', [220, 110], 1, {
        gain: 0.6,
        shape: 'swell',
        filter: lowpass(600),
        vibrato: { rate: 6, depth: 50 },
      }),
      tone('sawtooth', [233, 117], 1, {
        gain: 0.5,
        shape: 'swell',
        filter: lowpass(600),
        vibrato: { rate: 6, depth: 50 },
      }),
    ],
  },
  runeChime: {
    label: 'Rune Chime',
    category: 'magic',
    description: 'A glassy, metallic ring from a carved stone.',
    layers: [
      tone('sine', 1760, 0.9, { gain: 0.5, fm: { ratio: 3.5, depth: 0.6 } }),
      tone('sine', 2637, 0.7, { gain: 0.3 }),
      tone('sine', 3520, 0.5, { gain: 0.15 }),
    ],
  },
  potionPour: {
    label: 'Potion Pour',
    category: 'magic',
    description: 'Liquid glugging out of a narrow neck.',
    layers: [
      noise('pink', 0.9, bandpass([1500, 900], 2), { gain: 0.4, shape: 'hold' }),
      tone('sine', [500, 900], 0.12, {
        gain: 0.3,
        repeat: { count: 6, interval: 0.12, jitter: 0.5, pitchJitter: 0.3 },
      }),
    ],
  },
  witchCackle: {
    label: 'Witch Cackle',
    category: 'magic',
    description: 'A cracked, rasping laugh.',
    layers: [
      tone('sawtooth', [520, 640], 0.1, {
        gain: 0.4,
        filter: bandpass(1200, 3),
        vibrato: { rate: 14, depth: 350 },
        repeat: { count: 6, interval: 0.12, fade: 0.92, pitchJitter: 0.08 },
      }),
    ],
  },

  // --- Creatures & Voices --------------------------------------------------
  ghostMoan: {
    label: 'Ghost Moan',
    category: 'creatures',
    description: 'A long, wavering cry from nowhere.',
    layers: [
      tone('sine', [200, 320], 1.6, {
        gain: 0.8,
        shape: 'swell',
        filter: lowpass(1200),
        vibrato: { rate: 5, depth: 60 },
      }),
      tone('sine', [400, 640], 1.6, { gain: 0.3, shape: 'swell', vibrato: { rate: 5.5, depth: 60 } }),
    ],
  },
  banshee: {
    label: 'Banshee',
    category: 'creatures',
    description: 'A thin, rising wail that sets teeth on edge.',
    layers: [
      tone('sawtooth', [600, 1400], 1.2, {
        gain: 0.4,
        shape: 'swell',
        filter: bandpass(1400, 2),
        vibrato: { rate: 7, depth: 120 },
      }),
      noise('white', 1.2, bandpass(3000, 1), { gain: 0.15, shape: 'swell' }),
    ],
  },
  wolfHowl: {
    label: 'Wolf Howl',
    category: 'creatures',
    description: 'A rising howl that falls away at the end.',
    layers: [
      tone('sine', [300, 620], 0.9, { gain: 0.7, shape: 'swell', vibrato: { rate: 5, depth: 25 } }),
      tone('sine', [620, 420], 1, { start: 0.9, gain: 0.7, attack: 0.12, vibrato: { rate: 5, depth: 35 } }),
      tone('sawtooth', [600, 1240], 0.9, { gain: 0.12, shape: 'swell', filter: lowpass(1800) }),
    ],
  },
  batScreech: {
    label: 'Bat Screech',
    category: 'creatures',
    description: 'Tiny high chirps, far too close.',
    layers: [
      tone('square', [4200, 6400], 0.08, {
        gain: 0.2,
        filter: bandpass(5000, 2),
        repeat: { count: 4, interval: 0.11, fade: 0.8 },
      }),
      tone('sine', [4100, 6200], 0.08, { gain: 0.2, repeat: { count: 4, interval: 0.11, fade: 0.8 } }),
    ],
  },
  ravenCaw: {
    label: 'Raven Caw',
    category: 'creatures',
    description: 'A harsh two-note call from a dead branch.',
    layers: [
      tone('sawtooth', [380, 220], 0.25, {
        gain: 0.6,
        filter: bandpass(900, 3),
        vibrato: { rate: 40, depth: 120 },
        repeat: { count: 2, interval: 0.35, fade: 0.8, pitchJitter: 0.05 },
      }),
    ],
  },
  spiderSkitter: {
    label: 'Spider Skitter',
    category: 'creatures',
    description: 'Many small legs, moving fast.',
    layers: [
      noise('white', 0.012, bandpass(6000, 3), {
        gain: 0.6,
        repeat: { count: 16, interval: 0.03, jitter: 0.9, fade: 0.96, pitchJitter: 0.2 },
      }),
    ],
  },
  heartbeat: {
    label: 'Heartbeat',
    category: 'creatures',
    description: 'Three slow beats. Yours, or something else.',
    layers: [
      tone('sine', [70, 45], 0.14, { repeat: { count: 3, interval: 0.85, fade: 0.8 } }),
      tone('sine', [60, 40], 0.12, { start: 0.22, gain: 0.7, repeat: { count: 3, interval: 0.85, fade: 0.8 } }),
    ],
  },
  breathing: {
    label: 'Breathing',
    category: 'creatures',
    description: 'A slow breath in, a slow breath out, very near.',
    layers: [
      noise('pink', 1.1, bandpass([400, 1200], 0.8), { gain: 0.6, shape: 'swell' }),
      noise('pink', 1.3, bandpass([1200, 400], 0.8), { start: 1.2, gain: 0.5, shape: 'swell' }),
    ],
  },
  growl: {
    label: 'Growl',
    category: 'creatures',
    description: 'A low, rumbling threat.',
    layers: [
      tone('sawtooth', [70, 55], 1, {
        gain: 0.8,
        shape: 'hold',
        filter: lowpass([500, 250], 3),
        vibrato: { rate: 28, depth: 150 },
      }),
      noise('brown', 1, lowpass(300), { gain: 0.5, shape: 'hold' }),
    ],
  },
  whisper: {
    label: 'Whisper',
    category: 'creatures',
    description: 'Hushed breath right behind your ear.',
    layers: [
      noise('pink', 1.2, bandpass([2500, 3500], 3), { gain: 0.6, shape: 'swell' }),
      noise('pink', 1, bandpass([1800, 2800], 3), { start: 0.2, gain: 0.4, shape: 'swell' }),
    ],
  },
  zombieGroan: {
    label: 'Zombie Groan',
    category: 'creatures',
    description: 'A slow, rattling moan from a worn-out throat.',
    layers: [
      tone('sawtooth', [90, 60], 1.2, {
        gain: 0.7,
        shape: 'swell',
        filter: lowpass([700, 300], 2),
        vibrato: { rate: 4, depth: 80 },
      }),
      tone('sawtooth', [95, 63], 1.2, {
        gain: 0.5,
        shape: 'swell',
        filter: lowpass([700, 300], 2),
        vibrato: { rate: 4, depth: 80 },
      }),
    ],
  },
  owlHoot: {
    label: 'Owl Hoot',
    category: 'creatures',
    description: 'Two soft calls from somewhere in the trees.',
    layers: [
      tone('sine', [420, 380], 0.3, {
        gain: 0.7,
        shape: 'hold',
        attack: 0.06,
        vibrato: { rate: 6, depth: 20 },
        repeat: { count: 2, interval: 0.55, fade: 0.9 },
      }),
    ],
  },

  // --- Atmosphere ----------------------------------------------------------
  windHowl: {
    label: 'Wind Howl',
    category: 'ambience',
    description: 'Wind moaning through cracks in the stone.',
    layers: [
      noise('pink', 2.5, bandpass([500, 1100], 4), { gain: 0.7, shape: 'swell' }),
      noise('pink', 2, bandpass([900, 500], 4), { start: 0.5, gain: 0.4, shape: 'swell' }),
    ],
  },
  thunder: {
    label: 'Thunder',
    category: 'ambience',
    description: 'A crack, then a long roll across the sky.',
    layers: [
      noise('brown', 2.6, lowpass([1500, 120]), { gain: 1 }),
      tone('sine', [60, 30], 1.8, { start: 0.1, gain: 0.8 }),
      noise('white', 0.15, lowpass(4000), { gain: 0.6 }),
      noise('brown', 2, lowpass(300), { start: 0.4, gain: 0.6, shape: 'swell' }),
    ],
  },
  rainPatter: {
    label: 'Rain Patter',
    category: 'ambience',
    description: 'Drops on a crypt roof.',
    layers: [
      noise('white', 0.02, highpass(3000), {
        gain: 0.35,
        repeat: { count: 40, interval: 0.03, jitter: 1, pitchJitter: 0.3 },
      }),
      noise('pink', 1.4, lowpass(4000), { gain: 0.2, shape: 'hold' }),
    ],
  },
  churchBell: {
    label: 'Church Bell',
    category: 'ambience',
    description: 'One deep strike that hangs in the air.',
    layers: bell(196, 3.5),
  },
  cryptDrone: {
    label: 'Crypt Drone',
    category: 'ambience',
    description: 'A low, uneasy hum with a slow beating pulse.',
    layers: [
      tone('sine', 55, 3, { gain: 0.6, shape: 'hold', attack: 0.8 }),
      tone('sine', 55.7, 3, { gain: 0.6, shape: 'hold', attack: 0.8 }),
      noise('brown', 3, lowpass(200), { gain: 0.3, shape: 'hold', attack: 0.8 }),
    ],
  },
  clockTick: {
    label: 'Clock Tick',
    category: 'ambience',
    description: 'Four ticks from a clock in an empty hall.',
    layers: [
      tone('sine', [1400, 1000], 0.04, { gain: 0.5, repeat: { count: 4, interval: 0.5 } }),
      noise('white', 0.02, highpass(3000), { gain: 0.5, repeat: { count: 4, interval: 0.5 } }),
    ],
  },

  // --- Alerts & Stings -----------------------------------------------------
  jumpScare: {
    label: 'Jump Scare',
    category: 'alerts',
    description: 'A sudden, harsh blast. Turn it down first.',
    layers: [
      noise('white', 0.6, highpass([2000, 400]), { gain: 0.9 }),
      tone('sawtooth', [880, 1760], 0.6, { gain: 0.7 }),
      tone('sawtooth', [932, 1864], 0.6, { gain: 0.7 }),
      tone('sine', [55, 40], 0.6, { gain: 0.9 }),
    ],
  },
  horrorSting: {
    label: 'Horror Sting',
    category: 'alerts',
    description: 'A dissonant chord over a deep hit.',
    layers: [
      tone('sawtooth', 220, 1.4, { gain: 0.5, filter: lowpass(1500), vibrato: { rate: 5, depth: 30 } }),
      tone('sawtooth', 233, 1.4, { gain: 0.5, filter: lowpass(1500), vibrato: { rate: 5, depth: 30 } }),
      tone('sawtooth', 311, 1.4, { gain: 0.5, filter: lowpass(1500), vibrato: { rate: 5, depth: 30 } }),
      tone('sine', [80, 40], 0.5, { gain: 0.9 }),
    ],
  },
  deathKnell: {
    label: 'Death Knell',
    category: 'alerts',
    description: 'Three slow tolls of a low bell.',
    layers: bell(147, 3.2).map((layer) => ({
      ...layer,
      repeat: { count: 3, interval: 2.4, fade: 0.8 },
    })),
  },
  resolve: {
    label: 'Resolve',
    category: 'alerts',
    description: 'Three calm notes. Whatever it was, it is done.',
    layers: [
      tone('sine', 587, 0.8, { gain: 0.6 }),
      tone('sine', 698, 0.8, { start: 0.14, gain: 0.6 }),
      tone('sine', 880, 1.1, { start: 0.28, gain: 0.6 }),
    ],
  },
  errorBuzz: {
    label: 'Error Buzz',
    category: 'alerts',
    description: 'Two flat, rough buzzes.',
    layers: [
      tone('sawtooth', 110, 0.25, {
        gain: 0.6,
        shape: 'hold',
        filter: lowpass(800),
        repeat: { count: 2, interval: 0.3 },
      }),
    ],
  },
  notifyBell: {
    label: 'Notify Bell',
    category: 'alerts',
    description: 'A bright little bell, like a ringtone.',
    layers: [
      tone('sine', 1568, 1, { gain: 0.5, fm: { ratio: 2.01, depth: 0.4 } }),
      tone('sine', 2349, 0.6, { gain: 0.25 }),
    ],
  },
  alarmBeep: {
    label: 'Alarm Beep',
    category: 'alerts',
    description: 'Four urgent beeps.',
    layers: [
      tone('square', 880, 0.12, {
        gain: 0.35,
        shape: 'hold',
        filter: lowpass(3000),
        repeat: { count: 4, interval: 0.2 },
      }),
    ],
  },

  // --- CPU, Machines & Desktop Daily Sounds --------------------------------
  cpuClock: {
    label: 'CPU Clock Cycle',
    category: 'machines',
    description: 'Rapid micro-processor clock cycle pulse and data bus ticks.',
    tags: ['cpu', 'computer', 'chip', 'clock', 'frequency'],
    layers: [
      tone('square', [1400, 2800], 0.015, { gain: 0.5, repeat: { count: 3, interval: 0.025 } }),
      noise('white', 0.008, highpass(3500), { gain: 0.3, repeat: { count: 3, interval: 0.025 } }),
    ],
  },
  floppySeek: {
    label: 'Floppy Drive Seek',
    category: 'machines',
    description: 'Mechanical stepper motor head chattering across 3.5" disk tracks.',
    tags: ['floppy', 'disk', 'drive', 'stepper', 'retro'],
    layers: [
      tone('square', [220, 140], 0.035, { gain: 0.7, repeat: { count: 4, interval: 0.045, jitter: 0.1 } }),
      noise('white', 0.02, bandpass(1800, 3), { gain: 0.6, repeat: { count: 4, interval: 0.045 } }),
      tone('sine', [80, 50], 0.22, { gain: 0.4 }),
    ],
  },
  hardDriveCrunch: {
    label: 'HDD Head Thrash',
    category: 'machines',
    description: 'Vintage magnetic platter spin and seek head data crunch.',
    tags: ['hard drive', 'hdd', 'seek', 'read', 'write'],
    layers: [
      noise('brown', 0.35, lowpass(500), { gain: 0.5 }),
      noise('white', 0.025, bandpass(2200, 4), { gain: 0.7, repeat: { count: 5, interval: 0.05, jitter: 0.2 } }),
      tone('triangle', [90, 70], 0.3, { gain: 0.3 }),
    ],
  },
  modemHandshake: {
    label: '56k Modem Handshake',
    category: 'machines',
    description: 'Dial-up carrier negotiation chirp, dual-tone negotiation, and static hiss.',
    tags: ['modem', 'dialup', '56k', 'internet', 'carrier', 'retro'],
    layers: [
      tone('sine', [941, 1336], 0.14, { gain: 0.6 }),
      tone('square', [1209, 1477], 0.14, { start: 0.15, gain: 0.5 }),
      tone('sine', [2100, 2100], 0.25, { start: 0.3, gain: 0.7 }),
      noise('white', 0.22, bandpass(1800, 2), { start: 0.52, gain: 0.45 }),
    ],
  },
  crtPowerOn: {
    label: 'CRT Degauss & Whine',
    category: 'machines',
    description: 'Heavy electromagnetic degauss thud followed by 15.7kHz flyback squeal.',
    tags: ['crt', 'monitor', 'degauss', 'screen', 'flyback'],
    layers: [
      tone('sine', [120, 35], 0.35, { gain: 0.9, shape: 'decay' }),
      noise('brown', 0.2, lowpass(200), { gain: 0.8 }),
      tone('sine', [12000, 15734], 0.6, { start: 0.1, gain: 0.25, shape: 'swell' }),
    ],
  },
  mechanicalClick: {
    label: 'IBM Model M Click',
    category: 'machines',
    description: 'Satisfying tactile buckling spring switch click and metallic ping.',
    tags: ['keyboard', 'model m', 'click', 'switch', 'keystroke'],
    layers: [
      noise('white', 0.025, highpass(2400), { gain: 0.8 }),
      tone('sine', [3200, 2400], 0.04, { gain: 0.5 }),
      tone('triangle', [220, 110], 0.06, { gain: 0.6 }),
    ],
  },
  solenoidThud: {
    label: 'Teletype Solenoid',
    category: 'machines',
    description: 'Heavy inductive hammer thud of an electro-mechanical terminal.',
    tags: ['solenoid', 'typewriter', 'teletype', 'terminal'],
    layers: [
      tone('triangle', [160, 60], 0.08, { gain: 0.85 }),
      noise('brown', 0.05, lowpass(400), { gain: 0.7 }),
      tone('sine', [900, 400], 0.03, { gain: 0.4 }),
    ],
  },
  biosPostBeep: {
    label: 'BIOS POST Beep',
    category: 'machines',
    description: 'The single reassuring 880Hz square beep of an 8086 system boot.',
    tags: ['bios', 'post', 'beep', 'pc speaker', 'boot'],
    layers: [
      tone('square', 880, 0.18, { gain: 0.6, filter: lowpass(2400) }),
    ],
  },
  terminalBell: {
    label: 'ASCII Terminal Bell',
    category: 'machines',
    description: 'Classic ASCII 0x07 teleprinter alert chime.',
    tags: ['bell', 'terminal', 'ascii', '0x07', 'alert'],
    layers: bell(1760, 0.6),
  },

  // --- Computer Easter Eggs ------------------------------------------------
  bsodCrash: {
    label: 'Fatal Panic / BSOD (Egg)',
    category: 'machines',
    description: 'Descending digital error buzz that flatlines into audio glitch.',
    tags: ['egg', 'bsod', 'crash', 'error', 'panic', 'easter egg'],
    layers: [
      tone('sawtooth', [440, 55], 0.28, { gain: 0.8, filter: lowpass(1200) }),
      tone('square', 110, 0.4, { start: 0.25, gain: 0.7 }),
      noise('white', 0.15, highpass(3000), { start: 0.2, gain: 0.4 }),
    ],
  },
  possessedCpu: {
    label: 'Possessed CPU (Egg)',
    category: 'machines',
    description: 'Overclocked arithmetic cycles dissolving into a cold demonic breath.',
    tags: ['egg', 'possessed', 'cpu', 'ghost', 'haunted', 'easter egg'],
    layers: [
      tone('square', [3500, 800], 0.12, { gain: 0.5, repeat: { count: 3, interval: 0.06 } }),
      noise('pink', 0.6, bandpass([1800, 400], 3), { start: 0.15, gain: 0.6, shape: 'swell' }),
      tone('sine', [110, 45], 0.7, { start: 0.1, gain: 0.7 }),
    ],
  },
  underworldDialup: {
    label: 'Underworld Carrier (Egg)',
    category: 'machines',
    description: 'Dial-up handshake that connects directly to subterranean depths.',
    tags: ['egg', 'dialup', 'underworld', 'demon', 'hell', 'easter egg'],
    layers: [
      tone('sine', [1200, 600], 0.15, { gain: 0.6 }),
      tone('sawtooth', [600, 150], 0.35, { start: 0.12, gain: 0.5 }),
      noise('brown', 0.8, lowpass(300), { start: 0.25, gain: 0.8, shape: 'swell' }),
      tone('sine', 55, 0.8, { start: 0.3, gain: 0.6 }),
    ],
  },
});

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------

/** Name of a built-in sound effect. */
export type EffectName = keyof typeof EFFECT_SPECS;

/** Display details for each category. */
export const EFFECT_CATEGORIES: Record<EffectCategory, { label: string; blurb: string }> = {
  taps: { label: 'Taps & Clicks', blurb: 'Short sounds for buttons and feedback' },
  doors: { label: 'Doors & Locks', blurb: 'Hinges, bolts, chains, and gates' },
  impacts: { label: 'Impacts & Thuds', blurb: 'Stone, bone, wood, and earth' },
  magic: { label: 'Spells & Potions', blurb: 'Casting, brewing, and curses' },
  creatures: { label: 'Creatures & Voices', blurb: 'Things that breathe, moan, and howl' },
  ambience: { label: 'Atmosphere', blurb: 'Wind, storms, bells, and drones' },
  alerts: { label: 'Alerts & Stings', blurb: 'Notifications and sudden scares' },
  machines: { label: 'CPU & Retro Desktop', blurb: 'Processors, floppy drives, modems & computer Easter eggs' },
};

/**
 * Total length of a recipe in seconds, including repeats and their jitter.
 */
export const effectDuration = (layers: readonly EffectLayer[]): number =>
  layers.reduce((longest, layer) => {
    const repeat = layer.repeat;
    const span = repeat
      ? (Math.max(1, repeat.count) - 1) * repeat.interval + (repeat.jitter ?? 0) * repeat.interval
      : 0;
    return Math.max(longest, (layer.start ?? 0) + span + layer.length);
  }, 0);

/**
 * Turns a spec into a playable effect by adding its name and duration.
 * Use this to make your own effects for `playEffect`.
 *
 * @example
 * ```ts
 * const drip = createEffect('drip', {
 *   label: 'Drip',
 *   category: 'ambience',
 *   description: 'A single drop in a cave.',
 *   layers: [{ source: 'sine', freq: [1200, 600], length: 0.1 }],
 * });
 * playEffect(drip);
 * ```
 */
export const createEffect = (name: string, spec: EffectSpec): EffectDefinition => ({
  ...spec,
  name,
  duration: effectDuration(spec.layers),
});

/** Every built-in effect, ready to play, by name. */
export const EFFECTS = Object.fromEntries(
  Object.entries(EFFECT_SPECS).map(([name, spec]) => [name, createEffect(name, spec)])
) as Record<EffectName, EffectDefinition>;

/** Every built-in effect as a list, in catalog order. */
export const EFFECT_LIST: readonly EffectDefinition[] = Object.values(EFFECTS);

/** Every built-in effect name. */
export const EFFECT_NAMES = Object.keys(EFFECTS) as EffectName[];

/**
 * Filters the catalog by category and a search phrase. The phrase matches
 * names, labels, descriptions, tags, and category names.
 */
export const listEffects = (
  filter: { category?: EffectCategory | 'all'; query?: string } = {}
): EffectDefinition[] => {
  const { category = 'all', query = '' } = filter;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);

  return EFFECT_LIST.filter((effect) => {
    if (category !== 'all' && effect.category !== category) return false;
    if (words.length === 0) return true;
    const haystack = [
      effect.name,
      effect.label,
      effect.description,
      EFFECT_CATEGORIES[effect.category].label,
      ...(effect.tags ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
};
