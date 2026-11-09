/**
 * The bestiary cast.
 *
 * Every creature is just data fed to the renderer. Layers are stacked SVG
 * shapes (back to front); the `Character` component gives that flat art a
 * dimensional feel with pointer tilt, shading, and a shadow. Colors come from
 * `creatureMaterials`; eye glow from the accent. To add a monster, copy a spec
 * and reshape the silhouette.
 *
 * Paths use the `0 0 100 100` viewBox.
 *
 * @module components/bestiary/characters
 */

import { defineCharacter } from './types';
import { creatureMaterials as m } from './characterTokens';

/** Bat - leathery wings, pin ears, a little menace. */
export const batSpec = defineCharacter({
  id: 'bat',
  name: 'Vesper',
  tagline: 'Out hunting the moment the sun quits',
  accent: 'witchfire',
  hoverSound: 'boneClick',
  layers: [
    { d: 'M50 52 C30 30 14 34 6 46 C18 44 20 54 30 52 C22 60 26 66 34 64 C40 60 46 58 50 58 Z', fill: m.membrane.wing },
    { d: 'M50 52 C70 30 86 34 94 46 C82 44 80 54 70 52 C78 60 74 66 66 64 C60 60 54 58 50 58 Z', fill: m.membrane.wing },
    { d: 'M40 36 L36 22 L46 32 Z', fill: m.membrane.bat },
    { d: 'M60 36 L64 22 L54 32 Z', fill: m.membrane.bat },
    { d: 'M50 34 C60 34 66 42 66 52 C66 64 58 70 50 70 C42 70 34 64 34 52 C34 42 40 34 50 34 Z', fill: m.membrane.bat },
  ],
  eyes: [{ cx: 44, cy: 48, r: 3.4 }, { cx: 56, cy: 48, r: 3.4 }],
});

/** Vampire - slick hairline, high collar, bloodlust. */
export const vampireSpec = defineCharacter({
  id: 'vampire',
  name: 'Lord Alucard',
  tagline: 'Charming until the candles go out',
  accent: 'blood',
  hoverSound: 'coffinCreak',
  layers: [
    { d: 'M18 92 C18 66 30 58 50 58 C70 58 82 66 82 92 Z', fill: m.cloth.vampire },
    { d: 'M30 70 C30 60 38 58 50 58 C62 58 70 60 70 70 L50 76 Z', fill: m.cloth.vampireLining },
    { d: 'M34 34 C34 26 42 22 50 22 C58 22 66 26 66 40 C66 54 58 62 50 62 C42 62 34 54 34 34 Z', fill: m.flesh.corpse },
    { d: 'M34 34 C34 24 42 18 50 18 C58 18 66 24 66 34 C62 30 58 30 50 36 C42 30 38 30 34 34 Z', fill: m.cloth.vampire },
  ],
  eyes: [{ cx: 44, cy: 40, r: 3 }, { cx: 56, cy: 40, r: 3 }],
});

/** Snowman - stacked spheres, carrot nose, top hat. */
export const snowmanSpec = defineCharacter({
  id: 'snowman',
  name: 'Mr. Frost',
  tagline: 'Friendly now, but winters are long',
  accent: 'frost',
  hoverSound: 'stoneGrind',
  layers: [
    { d: 'M50 92 C34 92 26 84 26 74 C26 64 34 58 50 58 C66 58 74 64 74 74 C74 84 66 92 50 92 Z', fill: m.fur.snow },
    { d: 'M50 60 C40 60 34 54 34 46 C34 38 40 32 50 32 C60 32 66 38 66 46 C66 54 60 60 50 60 Z', fill: m.fur.snow },
    { d: 'M38 30 H62 V32 H38 Z', fill: m.membrane.batShade },
    { d: 'M42 12 H58 V30 H42 Z', fill: m.membrane.batShade },
    { d: 'M50 46 L64 48 L50 50 Z', fill: m.gourd.pumpkin },
  ],
  eyes: [{ cx: 44, cy: 44, r: 2.6 }, { cx: 56, cy: 44, r: 2.6 }],
});

/** Yeti - shaggy fur mound, dark face patch. */
export const yetiSpec = defineCharacter({
  id: 'yeti',
  name: 'Himal',
  tagline: 'The mountain remembers every climber',
  accent: 'frost',
  hoverSound: 'stoneGrind',
  layers: [
    { d: 'M50 94 C28 94 18 80 20 58 C22 38 34 26 50 26 C66 26 78 38 80 58 C82 80 72 94 50 94 Z', fill: m.fur.snow },
    { d: 'M50 94 C28 94 18 80 20 58 C26 62 34 64 34 72 C40 68 44 72 50 72 C56 72 60 68 66 72 C66 64 74 62 80 58 C82 80 72 94 50 94 Z', fill: m.fur.frost, opacity: 0.8 },
    { d: 'M38 44 C38 38 44 34 50 34 C56 34 62 38 62 46 C62 56 56 60 50 60 C44 60 38 56 38 44 Z', fill: m.fur.frost },
  ],
  eyes: [{ cx: 44, cy: 46, r: 3 }, { cx: 56, cy: 46, r: 3 }],
});

/** Pumpkin - carved jack-o'-lantern with ember grin. */
export const pumpkinSpec = defineCharacter({
  id: 'pumpkin',
  name: 'Jack',
  tagline: 'Carved, lit, and grinning in the dark',
  accent: 'ember',
  hoverSound: 'boneClick',
  layers: [
    // Shell + ribs
    { d: 'M50 84 C30 84 20 70 20 54 C20 40 32 32 50 32 C68 32 80 40 80 54 C80 70 70 84 50 84 Z', fill: m.gourd.pumpkin },
    { d: 'M34 36 C30 48 30 66 36 80 C32 70 32 48 34 36 Z', fill: m.gourd.pumpkinShade, opacity: 0.7 },
    { d: 'M66 36 C70 48 70 66 64 80 C68 70 68 48 66 36 Z', fill: m.gourd.pumpkinShade, opacity: 0.7 },
    // Stem
    { d: 'M46 30 C46 22 50 18 54 18 C50 22 54 28 54 32 Z', fill: m.gourd.stem },
    // Carved grin: a wide curved mouth with two fang notches.
    { d: 'M30 60 Q50 80 70 60 Q58 66 50 66 Q42 66 30 60 Z', fill: m.gourd.stemChar },
    { d: 'M42 62 L45 68 L48 62 Z', fill: m.gourd.pumpkin },
    { d: 'M52 62 L55 68 L58 62 Z', fill: m.gourd.pumpkin },
  ],
  eyes: [{ cx: 40, cy: 50, r: 4.4 }, { cx: 60, cy: 50, r: 4.4 }],
});

/** Frankenstein's monster - flat skull, neck bolts, stitches. */
export const frankensteinSpec = defineCharacter({
  id: 'frankenstein',
  name: 'The Patchwork Man',
  tagline: 'Stitched together and quietly misunderstood',
  accent: 'emerald',
  hoverSound: 'stoneGrind',
  layers: [
    { d: 'M40 76 H60 V92 H40 Z', fill: m.flesh.frankensteinShade },
    { d: 'M34 80 H40 V88 H34 Z', fill: m.hard.bolt },
    { d: 'M60 80 H66 V88 H60 Z', fill: m.hard.bolt },
    { d: 'M34 30 H66 V66 C66 74 60 78 50 78 C40 78 34 74 34 66 Z', fill: m.flesh.frankenstein },
    { d: 'M32 30 H68 V40 H32 Z', fill: m.cloth.vampire },
    { d: 'M40 50 H58 M43 47 V53 M48 47 V53 M53 47 V53', stroke: m.hard.stitch, strokeWidth: 1.4, fill: 'none' },
  ],
  eyes: [{ cx: 44, cy: 46, r: 3 }, { cx: 56, cy: 46, r: 3 }],
});

/** Goblin - big ears, hooked nose, toothy sneer. */
export const goblinSpec = defineCharacter({
  id: 'goblin',
  name: 'Snagtooth',
  tagline: 'Will trade anything for something shinier',
  accent: 'gold',
  hoverSound: 'boneClick',
  layers: [
    { d: 'M34 44 L14 32 L30 54 Z', fill: m.flesh.goblin },
    { d: 'M66 44 L86 32 L70 54 Z', fill: m.flesh.goblin },
    { d: 'M34 44 L20 36 L31 50 Z', fill: m.flesh.goblinShade },
    { d: 'M66 44 L80 36 L69 50 Z', fill: m.flesh.goblinShade },
    { d: 'M36 36 C36 28 42 24 50 24 C58 24 64 28 64 38 C64 52 58 68 50 72 C42 68 36 52 36 36 Z', fill: m.flesh.goblin },
    { d: 'M50 44 C54 48 56 54 52 58 C50 56 48 54 48 50 Z', fill: m.flesh.goblinShade },
  ],
  eyes: [{ cx: 44, cy: 42, r: 3 }, { cx: 56, cy: 42, r: 3 }],
});

/** Candyman - top hat, hook, swarm of sweetness. */
export const candymanSpec = defineCharacter({
  id: 'candyman',
  name: 'The Candyman',
  tagline: 'Say his name five times if you dare',
  accent: 'blood',
  hoverSound: 'coffinCreak',
  layers: [
    { d: 'M22 92 C22 72 34 64 50 64 C66 64 78 72 78 92 Z', fill: m.cloth.coat },
    { d: 'M36 36 C36 26 42 22 50 22 C58 22 64 26 64 42 C64 56 58 62 50 62 C42 62 36 56 36 36 Z', fill: m.flesh.candyman },
    { d: 'M36 44 C40 60 44 66 50 66 C56 66 60 60 64 44 C58 54 42 54 36 44 Z', fill: m.hard.bolt, opacity: 0.6 },
    { d: 'M30 24 H70 V28 H30 Z', fill: m.cloth.vampire },
    { d: 'M38 10 H62 V24 H38 Z', fill: m.cloth.vampire },
  ],
  eyes: [{ cx: 44, cy: 40, r: 3 }, { cx: 56, cy: 40, r: 3 }],
});

/** Ghost - drifting sheet with a wavy hem. */
export const ghostSpec = defineCharacter({
  id: 'ghost',
  name: 'Wisp',
  tagline: 'Still looking for a door that no longer exists',
  accent: 'void',
  hoverSound: 'coffinCreak',
  layers: [
    { d: 'M26 48 C26 30 38 20 50 20 C62 20 74 30 74 48 L74 84 L66 76 L58 84 L50 76 L42 84 L34 76 L26 84 Z', fill: m.fur.snow, opacity: 0.92 },
    { d: 'M26 48 C26 30 38 20 50 20 C62 20 74 30 74 48 L74 60 C62 56 38 56 26 60 Z', fill: m.fur.frost, opacity: 0.5 },
  ],
  eyes: [{ cx: 42, cy: 44, r: 3.4 }, { cx: 58, cy: 44, r: 3.4 }],
});

/** Mummy - wrapped linen with trailing bandage. */
export const mummySpec = defineCharacter({
  id: 'mummy',
  name: 'Ankhef',
  tagline: 'Woke up in the wrong millennium',
  accent: 'gold',
  hoverSound: 'stoneGrind',
  layers: [
    { d: 'M32 90 C32 60 38 40 50 28 C62 40 68 60 68 90 Z', fill: m.hard.bone },
    { d: 'M34 54 L66 50 M33 66 L67 64 M34 78 L66 80', stroke: m.flesh.corpse, strokeWidth: 1.6, fill: 'none', opacity: 0.7 },
    { d: 'M38 30 C38 22 44 18 50 18 C56 18 62 22 62 32 C62 44 56 50 50 50 C44 50 38 44 38 30 Z', fill: m.hard.bone },
    { d: 'M42 38 C42 34 46 32 50 32 C54 32 58 34 58 40 C58 46 54 48 50 48 C46 48 42 46 42 38 Z', fill: m.membrane.batShade },
  ],
  eyes: [{ cx: 46, cy: 40, r: 2.6 }, { cx: 54, cy: 40, r: 2.6 }],
});

/** The full cast, in showcase order. */
export const bestiary = [
  batSpec,
  vampireSpec,
  snowmanSpec,
  yetiSpec,
  pumpkinSpec,
  frankensteinSpec,
  goblinSpec,
  candymanSpec,
  ghostSpec,
  mummySpec,
] as const;
