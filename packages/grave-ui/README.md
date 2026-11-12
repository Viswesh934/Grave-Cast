# Groove UI

A horror-themed React library where every sound is synthesized, every stone is weathered by hand, and every browser trick comes with a ghost story.

Install it with `npm install groove-ui`, import `groove-ui/styles.css` once, and you're haunted. Works with React 18 and 19.

---

## 🪦 The Crypt: components with real character

Tombstones, coffins, cauldrons, cobwebs, blood vials, moon phases, a witch on a broom. Each one is built on three small primitives (a button, a card, and a badge), so they all share the same feel and the same accessibility.

The headstone is a good example of the care that goes in. It's pure CSS: layered granite gradients, mineral flecks drawn with SVG noise, an incised border, and letters that look cut into the stone. Turn up its weathering and it ages the way real stones do: the polish fades, rain streaks appear, lichen settles at the edges, and finally cracks and moss take over.

## 🕯️ The 3D Vault: the same stones, in WebGL

Many components have a 3D twin built on Three.js and React Three Fiber. The 3D headstone runs a custom shader that paints the same four stages of decay, lit by a torch that follows your cursor. For browsers without WebGL, or people who prefer less motion, the 3D versions can step aside for their 2D counterparts.

## 🔊 The Sound Cellar: no audio files at all

Over sixty effects, from coffin creaks and wolf howls to church bells and old floppy drives, and not a single audio file. Each sound is a short recipe of tones and filtered noise that the Web Audio API plays on the spot. That keeps the package tiny, lets you change the pitch of any sound, and means a new sound is just a new recipe.

Everything plays through one shared audio channel with a limiter, so stacking sounds won't blow out your speakers. Sound stays off until you switch it on, and any effect can be saved as a WAV file.

## 🎙️ The Séance Room: voice, music, and video

- **Voice:** record yourself and play it back as a demon, a ghost, an imp, or a dead radio.
- **Music:** a synth that knows scales and ragas, in equal or just tuning.
- **Studio:** a small multitrack studio that records takes and mixes them down.
- **Camera:** turn a live camera feed into ASCII art, give it a surveillance-camera look, or watch for motion.

All of it runs in the browser. Nothing gets uploaded.

## 📖 The Grimoire: twelve rites for modern browser powers

Each rite takes one modern browser capability and wraps it in a ready-made, themed panel.

| Rite | What it does |
| --- | --- |
| **Medium** | Sees through any element: its box, its colors, and whether its text can be read |
| **Soul Reader** | Finds text that fails contrast, and picks any color off the screen |
| **Haunted Ink** | Makes words glow anywhere on the page without touching the HTML |
| **Autopsy** | Measures how fast the page loaded, how much it jumped, and how quickly it responds |
| **Necromancer** | Freezes, slows, and scrubs every animation on the page |
| **Poltergeist** | Watches every change to the page, causes mischief, and undoes it all |
| **Watching Eyes** | Shows which parts of the page were on screen, and for how long, as a heatmap |
| **Crypt** | Saves things on the device so they survive a reload |
| **Seal** | Locks a message with a passphrase (real encryption, and nothing leaves the device) |
| **Vigil** | Keeps the screen awake while a candle burns |
| **Séance** | Lets open tabs of the same site see each other and pass whispers |
| **Apparition** | Makes page changes fade or rise into place instead of snapping |

Every rite follows the same rules:

- It does nothing until someone asks.
- It explains plainly when a browser can't do it.
- It cleans up after itself completely.

That shared lifecycle is a single hook, so writing a thirteenth rite takes a few lines.

## ✏️ Scribble: draw on anything

An Excalidraw-style drawing layer you can drop over any page. It has pens, highlighters, arrows, shapes, and text, with a sketchy hand-drawn mode. Each tool has a one-letter shortcut.

- **Laser pointer:** for presenting. Its trail fades and is never saved.
- **Eraser:** fades shapes as you sweep over them and only removes them when you let go, so a slip is easy to take back.
- **Saving and export:** drawings are kept on the device and can be exported as PNG or SVG.

## 🎨 The Palette: one source of truth

Colors, shadows, type, motion timing, and stacking order all come from one token set. Components, the stylesheet, and the optional Tailwind plugin share those values, so the whole library stays in tune.

Accessibility is built in:

- Colors are chosen to stay readable.
- Motion respects reduced-motion settings.
- Controls work from the keyboard.
- Changes are announced to screen readers.

Full WCAG compliance still needs manual testing with assistive technology.

## ⚙️ How it's packaged

The library is shipped as modern ES modules, with one entry point per area, so you only load what you import. Shared pieces like the audio channel are bundled once, so the whole app shares one sound system. Full TypeScript types are included.

---

**Recently buried:** `ExcavationLoader3D` and `WitchOnBroom3D` are gone. Use the 2D loader and the new line-art witch instead. See the [changelog](./CHANGELOG.md).

MIT licensed.
