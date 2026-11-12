# Groove UI

Horror-themed React components, hooks, and browser tools with a folklore look. Graves, covens, cobwebs, a drawing layer, synthesized sound, and the Grimoire: twelve "rites" that show what the browser can do.

Package name: `groove-ui` (source folder `packages/grave-ui`).

## Install

```bash
npm install groove-ui react react-dom
```

React 18 or 19 is required as a peer dependency. The 3D components use `three`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing`. These install with the package, so you don't need to add them yourself.

### Styles

Import the stylesheet once, near the root of your app:

```ts
import 'groove-ui/styles.css';
```

If you use Tailwind CSS 4, point it at the package so the utility classes the components use get generated:

```css
@import "tailwindcss";
@source "../node_modules/groove-ui/dist";
@import "groove-ui/styles.css";
```

There is also an optional Tailwind plugin with token-based utilities:

```css
@plugin "groove-ui/tailwind";
```

The plugin is exported as `graveUIPlugin` (also the default export) if you prefer a JS config.

## Quick start

```tsx
import { TombstoneCard, CauldronBrew, AudioProvider } from 'groove-ui';

export function App() {
  return (
    <AudioProvider initialEnabled>
      <TombstoneCard
        title="Here Lies Version 1"
        subtitle="2019 – 2026"
        epitaph="It shipped, mostly."
        weathering="aged"
      />
      <CauldronBrew />
    </AudioProvider>
  );
}
```

## Entry points

Everything is exported from the root, `groove-ui`. Each area also has its own subpath, so bundlers only pull in what you use.

| Import | What's inside |
| --- | --- |
| `groove-ui/primitives` | `Button`, `Card`, `Badge` |
| `groove-ui/crypt` | `TombstoneCard`, `ExcavationLoader`, `MausoleumDrawer`, `BoneOssuaryDivider`, `CoffinAccordion`, `SpectralPortal` |
| `groove-ui/coven` | `CauldronBrew`, `RunicButton`, `WitchOnBroom` |
| `groove-ui/sanguine` | `BloodVialProgress` |
| `groove-ui/lycan` | `LunarPhaseSelector` |
| `groove-ui/slavic` | `ChickenLegStepper` |
| `groove-ui/arachnid` | `CobwebCorner` |
| `groove-ui/bestiary` | Bestiary characters |
| `groove-ui/horror3d` | `*3D` versions of the components, `GlobalCanvasProvider`, `TorchlightCursor`, plus re-exported `Canvas`, `useFrame`, `useThree`, `OrbitControls`, `Text`, `Center`, `Float`, `View` |
| `groove-ui/effects` | `Scribble`, `HorrorCursor`, `HorrorBackground`, `HauntedKeyboard`, `ClickToBegin`, `SoundLibrary`, `SoundTrigger`, `Ascii`, `SurveillanceCam`, `VoiceStudio` |
| `groove-ui/grimoire` | Rite specs, capability checks, color and DOM helpers, the ready-made `*Rite` panels and the parts they're built from |
| `groove-ui/audio` | `playSound`, `AudioProvider`, `useSpookyAudio`, the effect engine, music and mic helpers |
| `groove-ui/ascii` | ASCII art and video rendering |
| `groove-ui/video` | Video source helpers |
| `groove-ui/voice` | Speech and voice effects |
| `groove-ui/studio` | Recording studio helpers |
| `groove-ui/hooks` | All hooks (see below) |
| `groove-ui/tokens` | Design tokens |
| `groove-ui/tailwind` | `graveUIPlugin` |
| `groove-ui/styles.css` | Component styles |

## Components at a glance

### TombstoneCard

A carved granite headstone. `weathering` sets how much time has passed: `'pristine' | 'aged' | 'cracked' | 'crumbling'`. It also takes `title`, `subtitle`, `epitaph`, `showIcon`, `status`, and `statusVariant`. `TombstoneCard3D` in `groove-ui/horror3d` renders the same stone with a weathering shader.

### CauldronBrew

A bronze cauldron that bubbles over a fire.

### WitchOnBroom

A line-art witch flying across the screen. It replaces the old `WitchOnBroom3D`.

### CoffinAccordion

A compound component: `CoffinAccordion.Item`, `CoffinAccordion.Trigger`, `CoffinAccordion.Content`.

### SpectralPortal

A portal with a render-prop API.

## Scribble

Scribble lets people draw on top of any page, much like Excalidraw. It renders SVG, keeps an undo history, saves to `localStorage` when you give it a `storageKey`, and exports PNG or SVG.

```tsx
import { Scribble } from 'groove-ui/effects';

// A launcher button that opens a full-screen drawing layer
<Scribble storageKey="my-page-notes" />

// Or a drawing area inside your layout
<Scribble inline defaultOpen defaultTool="pen" />
```

Main props:

- Open state: `open` / `defaultOpen` / `onOpenChange`.
- Layout: `inline`, `showLauncher`, `keepVisible`.
- Tool setup: `defaultTool`, `defaultSketchy`, and custom `inks` and `widths`.
- Saving and exporting: `storageKey`, `exportBackground`, `fileName`.
- Changes: `onChange(shapes)`.

| Tool | Key | Notes |
| --- | --- | --- |
| Pen | P | Freehand |
| Highlighter | H | Wide, see-through |
| Line | L | |
| Arrow | A | |
| Rectangle | R | |
| Ellipse | O | |
| Text | T | Click to place |
| Laser pointer | K | A glowing trail that fades. It is never saved, undone, or exported. |
| Eraser | E | Shapes you touch dim as you drag and are removed on release, as one undo step. Escape puts them back. |

Ctrl+Z undoes and Ctrl+Shift+Z (or Ctrl+Y) redoes. Escape closes the layer.

For your own drawing UI, use `useScribble`. It returns the shapes along with `undo`, `redo`, `clear`, `load`, `addText`, the eraser controls (`startErasing`, `eraseAt`, `stopErasing`, `cancelErasing`, `pendingErase`), and the rest of the editing state. `useFadingTrail` powers the laser and eraser trails, and you can use it on its own. Use `scribbleToSvg` from the same module to export.

## Grimoire

The Grimoire is a set of twelve rites. Each one shows off a browser capability, checks whether that capability is available before using it, and ships as a ready-made panel. Each rite is also available as a hook if you want to build your own UI.

| Family | Rite | What it does | Panel |
| --- | --- | --- | --- |
| Seeing | Medium | Inspects any element: its box, its colors, and whether its text is readable | `MediumRite` |
| Seeing | Soul Reader | Reads a page's colors, flags text that fails contrast, and picks colors from the screen | `SoulReaderRite` |
| Seeing | Haunted Ink | Highlights words anywhere on the page without changing the DOM, using the CSS Highlight API | `HauntedInkRite` |
| Seeing | Autopsy | Measures LCP, CLS, INP, FCP, TTFB, and long tasks | `AutopsyRite` |
| Watching | Necromancer | Pauses, slows down, and scrubs every animation on the page | `NecromancerRite` |
| Watching | Poltergeist | Logs DOM changes, makes mischief on command, and undoes all of it | `PoltergeistRite` |
| Watching | Watching Eyes | Tracks which parts of the page were on screen, and for how long, and shows it as a heatmap | `WatchingEyesRite` |
| Keeping | Crypt | Stores data in IndexedDB, shows storage usage, and requests persistence | `CryptRite` |
| Keeping | Seal | Encrypts text with a passphrase using PBKDF2 and AES-GCM. Nothing leaves the device. | `SealRite` |
| Binding | Vigil | Keeps the screen awake (Wake Lock) and can go fullscreen | `VigilRite` |
| Binding | Séance | Lists the other open tabs of the site and passes messages between them (BroadcastChannel) | `SeanceRite` |
| Binding | Apparition | Animates DOM updates with View Transitions, and respects reduced motion | `ApparitionRite` |

```tsx
import { MediumRite, grimoireRites, findRite } from 'groove-ui/grimoire';

<MediumRite headingLevel={2} />
```

`grimoireRites` lists every rite spec: id, name, tagline, family, and browser support. `findRite(id)` looks one up by id. To write your own rite, combine `defineCapability` and `defineRite` with the `useRite(capability, options)` hook. The hook handles support checks, permissions, start and stop, and cleanup. Lower-level helpers are exported too: `sealText`/`openSeal`, `openCrypt`, `observeAutopsy`, `summon`, `auditContrast`, and the `color` and `dom` utilities.

## Hooks

All hooks are exported from `groove-ui/hooks`.

| Group | Hooks |
| --- | --- |
| Interaction | `useHorrorHover`, `useAnimationState`, `useCursorTracker`, `useHauntedKeystrokes`, `useTypewriter`, `useElementPicker`, `useElementBox`, `useCopyText`, `useEyeDropper`, `useFullscreen` |
| Drawing | `useScribble`, `useFadingTrail` |
| Grimoire | `useRite`, `useHauntedInk`, `useVigil`, `useNecromancer`, `useSeance`, `useMutationLog`, `useSeal`, `useWatchingEyes`, `useApparition`, `useAutopsy`, `useKeepsake` |
| Sound and media | `useSpookyMusic`, `useSoundLibrary`, `useSoundTrigger`, `useOccultMic`, `useMediaStream`, `useVideoSource`, `useFrameSampler`, `useAsciiVideo`, `useMotionDetector`, `useSpookySpeech`, `useVoiceEcho`, `useStudio` |
| Environment | `useMediaQuery`, `useReducedMotion`, `usePageVisible`, `useCapability`, `usePermissionState`, `useThemeToken`, `useHorrorFallback`, `useSnowfall` |
| Utilities | `useLatest`, `useEventListener`, `useRafLoop`, `useInterval`, `useNow`, `useAriaAnnounce`, `useIsomorphicLayoutEffect` |

## Sound

Every sound is synthesized with the Web Audio API, so there are no audio files to download.

```tsx
import { playSound, AudioProvider, useSpookyAudio } from 'groove-ui/audio';

// Anywhere
playSound('coffinCreak', 0.6);

// With a global on/off switch
function CreakButton() {
  const { playSound, enabled, setEnabled } = useSpookyAudio();
  return <button onClick={() => playSound('doorCreak')}>Knock</button>;
}

<AudioProvider initialEnabled={false}>{/* app */}</AudioProvider>
```

Some of the effect names: `boneClick`, `stoneTap`, `woodKnock`, `coffinCreak`, `doorCreak`, `gateSlam`, `chainRattle`, `cauldronBubble`, `spellCast`, `portalOpen`, `witchCackle`, `ghostMoan`, `banshee`, `wolfHowl`, `ravenCaw`, `heartbeat`, `whisper`, `zombieGroan`. The `SoundLibrary` component lists them all. Browsers only allow audio after the user interacts with the page; `ClickToBegin` handles that for you.

## Tokens

```ts
import { palette, colors, semanticColors, withAlpha, zLayers, srOnlyStyle } from 'groove-ui/tokens';
```

- `palette`, `colors`, and `semanticColors` hold the grave color system. `withAlpha(color, percent)` adds transparency to a color.
- `zLayers` is the shared stacking order. Use it instead of hard-coded z-index values. `zLayers.annotation` sits just under the cursor layers so Scribble draws over everything else.
- `srOnlyStyle` hides content visually but keeps it available to screen readers.
- Shadows, typography, animation easings and durations, and spacing scales are also exported.

## Accessibility

The components use semantic elements, keyboard support, visible focus states, and `aria-live` announcements (`useAriaAnnounce`). Motion respects `prefers-reduced-motion` (`useReducedMotion`). These are good foundations, but they don't guarantee WCAG compliance. Full validation needs manual testing with assistive technologies and an expert accessibility review of your own app.

## Browser support

Modern evergreen browsers. Some rites depend on newer APIs:

- EyeDropper
- CSS Custom Highlight API
- View Transitions
- Wake Lock
- Event Timing

When an API is missing, the rite reports partial or no support through its `support` spec and falls back gracefully. The 3D components need WebGL.

## Breaking changes since 0.1.0

- `ExcavationLoader3D` was removed. Use the 2D `ExcavationLoader`.
- `WitchOnBroom3D` was replaced by the line-art `WitchOnBroom` in `groove-ui/coven`.
- The old `useAudio()` URL-based API no longer exists. Use `playSound`, `AudioProvider`, and `useSpookyAudio`.

See [CHANGELOG.md](./CHANGELOG.md) for the full list.

## License

MIT
