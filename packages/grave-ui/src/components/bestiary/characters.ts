/**
 * The bestiary cast.
 *
 * Every creature is just data fed to the renderers. The 2D `layers` draw the
 * flat fallback; the optional `build3d` parts list drives the 3D scene (the
 * fun part). Colors come from `creatureMaterials`; eye glow from the accent.
 * To add a monster, copy a spec, reshape the silhouette + parts, and export it.
 *
 * 2D paths use the `0 0 100 100` viewBox. 3D parts live in a ~2-unit-tall box.
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
  build3d: {
    idle: 'bob',
    parts: [
      { shape: 'sphere', position: [0, 0, 0], size: 0.9, color: m.membrane.bat },
      { shape: 'cone', position: [-0.28, 0.5, 0], size: [0.3, 0.4, 0.3], color: m.membrane.bat },
      { shape: 'cone', position: [0.28, 0.5, 0], size: [0.3, 0.4, 0.3], color: m.membrane.bat },
      { shape: 'box', position: [-0.85, 0, -0.1], size: [0.9, 0.55, 0.05], rotation: [0, 0, 0.3], color: m.membrane.wing, motion: 'flap' },
      { shape: 'box', position: [0.85, 0, -0.1], size: [0.9, 0.55, 0.05], rotation: [0, 0, -0.3], color: m.membrane.wing, motion: 'flap' },
    ],
    eyes: [[-0.2, 0.05, 0.42], [0.2, 0.05, 0.42]],
  },
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
  build3d: {
    idle: 'sway',
    parts: [
      { shape: 'cone', position: [0, -0.55, 0], size: [1.2, 1.1, 1.2], color: m.cloth.vampire },
      { shape: 'cone', position: [0, -0.5, 0.2], size: [0.7, 0.8, 0.5], color: m.cloth.vampireLining, roughness: 0.5 },
      { shape: 'sphere', position: [0, 0.45, 0], size: 0.72, color: m.flesh.corpse },
      { shape: 'box', position: [0, 0.78, -0.05], size: [0.78, 0.3, 0.72], color: m.cloth.vampire },
    ],
    eyes: [[-0.17, 0.48, 0.33], [0.17, 0.48, 0.33]],
  },
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
  build3d: {
    idle: 'bob',
    parts: [
      { shape: 'sphere', position: [0, -0.7, 0], size: 1.0, color: m.fur.snow, roughness: 0.95 },
      { shape: 'sphere', position: [0, 0.1, 0], size: 0.75, color: m.fur.snow, roughness: 0.95 },
      { shape: 'sphere', position: [0, 0.7, 0], size: 0.55, color: m.fur.snow, roughness: 0.95 },
      { shape: 'cylinder', position: [0, 1.05, 0], size: [0.42, 0.08, 0.42], color: m.membrane.batShade },
      { shape: 'cylinder', position: [0, 1.25, 0], size: [0.3, 0.42, 0.3], color: m.membrane.batShade },
      { shape: 'cone', position: [0, 0.72, 0.45], size: [0.1, 0.35, 0.1], rotation: [1.4, 0, 0], color: m.gourd.pumpkin },
    ],
    eyes: [[-0.17, 0.82, 0.42], [0.17, 0.82, 0.42]],
  },
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
  build3d: {
    idle: 'sway',
    parts: [
      { shape: 'capsule', position: [0, -0.15, 0], size: [1.15, 1.15, 1.15], color: m.fur.snow, roughness: 0.98 },
      { shape: 'sphere', position: [0, 0.55, 0], size: 0.85, color: m.fur.snow, roughness: 0.98 },
      { shape: 'sphere', position: [0, 0.5, 0.35], size: [0.5, 0.45, 0.3], color: m.fur.frost, roughness: 0.9 },
      { shape: 'capsule', position: [-0.75, -0.1, 0], size: [0.3, 0.6, 0.3], rotation: [0, 0, 0.3], color: m.fur.snow, roughness: 0.98, motion: 'sway' },
      { shape: 'capsule', position: [0.75, -0.1, 0], size: [0.3, 0.6, 0.3], rotation: [0, 0, -0.3], color: m.fur.snow, roughness: 0.98, motion: 'sway' },
    ],
    eyes: [[-0.17, 0.55, 0.5], [0.17, 0.55, 0.5]],
  },
});

/** Pumpkin - carved jack-o'-lantern with ember grin. */
export const pumpkinSpec = defineCharacter({
  id: 'pumpkin',
  name: 'Jack',
  tagline: 'Carved, lit, and grinning in the dark',
  accent: 'ember',
  hoverSound: 'boneClick',
  layers: [
    { d: 'M50 84 C30 84 20 70 20 54 C20 40 32 32 50 32 C68 32 80 40 80 54 C80 70 70 84 50 84 Z', fill: m.gourd.pumpkin },
    { d: 'M34 36 C30 48 30 66 36 80 C32 70 32 48 34 36 Z', fill: m.gourd.pumpkinShade, opacity: 0.7 },
    { d: 'M66 36 C70 48 70 66 64 80 C68 70 68 48 66 36 Z', fill: m.gourd.pumpkinShade, opacity: 0.7 },
    { d: 'M46 30 C46 22 50 18 54 18 C50 22 54 28 54 32 Z', fill: m.gourd.stem },
  ],
  eyes: [{ cx: 40, cy: 52, r: 4.4 }, { cx: 60, cy: 52, r: 4.4 }],
  build3d: {
    idle: 'bob',
    parts: [
      { shape: 'sphere', position: [0, 0, 0], size: [1.15, 1.0, 1.1], color: m.gourd.pumpkin, roughness: 0.6 },
      { shape: 'sphere', position: [-0.55, 0, 0], size: [0.4, 0.95, 1.0], color: m.gourd.pumpkinShade, roughness: 0.6 },
      { shape: 'sphere', position: [0.55, 0, 0], size: [0.4, 0.95, 1.0], color: m.gourd.pumpkinShade, roughness: 0.6 },
      { shape: 'cylinder', position: [0, 0.6, 0], size: [0.1, 0.35, 0.1], color: m.gourd.stem, motion: 'sway' },
    ],
    eyes: [[-0.3, 0.1, 0.52], [0.3, 0.1, 0.52]],
    eyeSize: 0.13,
  },
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
  build3d: {
    idle: 'none',
    parts: [
      { shape: 'box', position: [0, -0.6, 0], size: [1.0, 0.7, 0.7], color: m.flesh.frankensteinShade },
      { shape: 'box', position: [0, 0.25, 0], size: [0.95, 1.0, 0.9], color: m.flesh.frankenstein },
      { shape: 'box', position: [0, 0.7, 0], size: [1.0, 0.28, 0.95], color: m.cloth.vampire },
      { shape: 'cylinder', position: [-0.6, 0.1, 0], size: [0.1, 0.3, 0.1], rotation: [0, 0, 1.57], color: m.hard.bolt },
      { shape: 'cylinder', position: [0.6, 0.1, 0], size: [0.1, 0.3, 0.1], rotation: [0, 0, 1.57], color: m.hard.bolt },
    ],
    eyes: [[-0.2, 0.3, 0.47], [0.2, 0.3, 0.47]],
  },
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
  build3d: {
    idle: 'bob',
    parts: [
      { shape: 'sphere', position: [0, 0, 0], size: [0.85, 0.95, 0.85], color: m.flesh.goblin },
      { shape: 'cone', position: [-0.7, 0.25, 0], size: [0.22, 0.6, 0.22], rotation: [0, 0, 1.0], color: m.flesh.goblin, motion: 'sway' },
      { shape: 'cone', position: [0.7, 0.25, 0], size: [0.22, 0.6, 0.22], rotation: [0, 0, -1.0], color: m.flesh.goblin, motion: 'sway' },
      { shape: 'cone', position: [0, -0.1, 0.42], size: [0.15, 0.35, 0.15], rotation: [1.2, 0, 0], color: m.flesh.goblinShade },
    ],
    eyes: [[-0.2, 0.15, 0.42], [0.2, 0.15, 0.42]],
  },
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
  build3d: {
    idle: 'sway',
    parts: [
      { shape: 'cone', position: [0, -0.6, 0], size: [1.1, 1.0, 1.1], color: m.cloth.coat },
      { shape: 'sphere', position: [0, 0.35, 0], size: 0.7, color: m.flesh.candyman },
      { shape: 'sphere', position: [0, 0.12, 0.25], size: [0.55, 0.4, 0.4], color: m.hard.bolt, roughness: 0.9 },
      { shape: 'cylinder', position: [0, 0.72, 0], size: [0.55, 0.08, 0.55], color: m.cloth.vampire },
      { shape: 'cylinder', position: [0, 0.95, 0], size: [0.4, 0.45, 0.4], color: m.cloth.vampire },
    ],
    eyes: [[-0.17, 0.4, 0.33], [0.17, 0.4, 0.33]],
  },
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
  build3d: {
    idle: 'bob',
    parts: [
      { shape: 'capsule', position: [0, 0.1, 0], size: [0.95, 1.2, 0.95], color: m.fur.snow, roughness: 1 },
      { shape: 'sphere', position: [-0.3, -0.7, 0], size: 0.32, color: m.fur.snow, roughness: 1, motion: 'bob' },
      { shape: 'sphere', position: [0.1, -0.75, 0], size: 0.3, color: m.fur.snow, roughness: 1, motion: 'bob' },
      { shape: 'sphere', position: [0.4, -0.7, 0], size: 0.28, color: m.fur.snow, roughness: 1, motion: 'bob' },
    ],
    eyes: [[-0.2, 0.3, 0.42], [0.2, 0.3, 0.42]],
  },
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
  build3d: {
    idle: 'sway',
    parts: [
      { shape: 'capsule', position: [0, -0.3, 0], size: [0.85, 1.0, 0.85], color: m.hard.bone, roughness: 0.95 },
      { shape: 'sphere', position: [0, 0.6, 0], size: 0.62, color: m.hard.bone, roughness: 0.95 },
      { shape: 'box', position: [0, 0.6, 0.32], size: [0.5, 0.22, 0.2], color: m.membrane.batShade },
      { shape: 'capsule', position: [-0.5, -0.1, 0], size: [0.2, 0.5, 0.2], rotation: [0, 0, 0.4], color: m.hard.bone, roughness: 0.95, motion: 'sway' },
      { shape: 'capsule', position: [0.5, -0.1, 0], size: [0.2, 0.5, 0.2], rotation: [0, 0, -0.4], color: m.hard.bone, roughness: 0.95, motion: 'sway' },
    ],
    eyes: [[-0.14, 0.6, 0.42], [0.14, 0.6, 0.42]],
    eyeSize: 0.07,
  },
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
