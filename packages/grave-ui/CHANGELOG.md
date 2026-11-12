# Changelog

All notable changes to Groovy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Grimoire**: twelve rites, each with a capability check, a hook, and a ready-made panel. Each panel is built from shared parts (`RiteShell`, `RiteLayer`, `RiteHighlight`, `RiteLabel`, `RiteSigil`, `RiteElementOutline`, `BoxModelDiagram`, `ColorSwatch`, `ContrastBadge`).
  - Seeing: Medium, Soul Reader, Haunted Ink, Autopsy
  - Watching: Necromancer, Poltergeist, Watching Eyes
  - Keeping: Crypt, Seal
  - Binding: Vigil, Séance, Apparition
- `defineCapability`, `defineRite`, `grimoireRites`, `findRite`, and the `useRite` hook for building your own rites.
- Grimoire helpers: color parsing and contrast, DOM journal and geometry, `sealText`/`openSeal`, `openCrypt`, `inspectStorage`, `requestPersistence`, `observeAutopsy`, `summon`, `auditContrast`.
- Formatting helpers: `formatMs`, `formatBytes`, `formatTimeOfDay`, `formatDuration`, `formatPx`, `formatSize`.
- **Scribble**: an on-screen drawing layer, like Excalidraw.
  - Tools: pen, highlighter, line, arrow, rectangle, ellipse, text.
  - Laser pointer (K): a fading trail that is never saved, undone, or exported.
  - Eraser (E): touched shapes dim while you drag and are removed on release as one undo step. Escape cancels the erase.
  - Sketchy mode, undo and redo, `localStorage` persistence, PNG and SVG export, keyboard shortcuts.
  - Inline or fullscreen layouts.
- `useScribble` and `useFadingTrail` hooks; `scribbleToSvg` and `exportScribble`.
- `WitchOnBroom`, a line-art witch in `groove-ui/coven`.
- `zLayers.annotation`, a stacking layer for drawing over the page.
- New hooks: `useElementBox`, `useElementPicker`, `useCopyText`, `usePageVisible`, `useEyeDropper`, `useFullscreen`, `useHauntedInk`, `useVigil`, `useNecromancer`, `useSeance`, `useMutationLog`, `useSeal`, `useWatchingEyes`, `useApparition`, `useAutopsy`, `useCapability`, `usePermissionState`, `useAriaAnnounce`, `useReducedMotion`, `useLatest`, `useEventListener`, `useRafLoop`, `useInterval`.

### Changed

- `CauldronBrew` is now bronze and sits over a fire backdrop.
- `TombstoneCard` is now carved granite, and the `weathering` levels (`pristine`, `aged`, `cracked`, `crumbling`) look more realistic.
- `TombstoneCard3D` has a new weathering shader.
- The README was rewritten from the real exports.

### Removed

- **Breaking:** `ExcavationLoader3D`. Use the 2D `ExcavationLoader`.
- **Breaking:** `WitchOnBroom3D`. Use `WitchOnBroom`.

### Fixed

- `TombstoneCard3D`'s stone shader was never attached to the mesh, so the weathering didn't show.
- `groove-ui/styles.css` points to `src/styles/grave-ui.css`, but that folder wasn't in the published `files`. It is now.
- The 0.1.0 notes below describe a `useAudio` hook. The real API is `playSound(effect, volume?)`, `AudioProvider`, and `useSpookyAudio`.

## [0.1.0] - 2026-11-08

### Added

#### Design System Foundation
- Complete design token system with modular organization
  - Color palette: grave-themed colors (dark, bone, crimson, moss, mist)
  - Shadows: cryptic shadows (ethereal, haunted, cursed, forbidden)
  - Typography: folklore-inspired font scales and families
  - Animations: easing functions and duration scales
  - Spacing: crypt-sized spacing system

#### Hooks (4)
- `useHorrorHover` - Enhanced hover interactions with callbacks
- `useAnimationState` - Animation state management
- `useMediaQuery` - Responsive design utilities
- `useThemeToken` - Type-safe token access

#### SVG Assets (5)
- `Skull` - Decorative skull icon
- `Coffin` - Coffin illustration
- `Cross` - Gothic cross symbol
- `Headstone` - Tombstone icon
- `Bone` - Bone graphic
- `SpookyFilters` - SVG filter definitions for atmospheric effects

#### Web Audio
- `SpookyAudio` - Web Audio API wrapper with sound management
- `AudioProvider` - React context for audio system
- `useAudio` - Hook for playing atmospheric sounds

#### Primitive Components (3)
- `Button` - Horror-themed button with variants (primary, secondary, ghost)
- `Card` - Atmospheric card container
- `Badge` - Informational badge with variants (info, warning, error, success)

#### Crypt Components (6)
- `TombstoneCard` - Ornate card with title, subtitle, and epitaph
- `ExcavationLoader` - Animated loading indicator with folklore theme
- `MausoleumDrawer` - Sliding drawer panel with dark styling
- `BoneOssuaryDivider` - Decorative section divider
- `CoffinAccordion` - Expandable accordion using compound component pattern
  - `CoffinAccordion.Item` - Individual accordion section
  - `CoffinAccordion.Trigger` - Clickable header
  - `CoffinAccordion.Content` - Collapsible content area
- `SpectralPortal` - Advanced portal component using render props pattern

#### Build & Tooling
- Tailwind CSS plugin for automatic component styling
- TypeScript declarations for full type safety
- Modular exports (main, primitives, hooks, tokens, tailwind)
- Tree-shakeable ESM build with tsup
- React 18+ and 19 support

#### Documentation
- Comprehensive README with examples
- TypeScript type definitions
- Inline JSDoc comments

### Package Details

- **Package name**: `groove-ui`
- **Initial version**: 0.1.0
- **License**: MIT
- **Peer dependencies**: React >=18.0.0, React DOM >=18.0.0, Tailwind CSS ^4.3.5

---

## Release Notes

This is the initial release of Groovy, a horror-themed component library built for creating atmospheric, folklore-inspired interfaces. The library includes a complete design system, reusable hooks, SVG assets, Web Audio utilities, and 9 components ranging from simple primitives to advanced patterns like compound components and render props.

All components are built with accessibility in mind, follow WCAG guidelines, and integrate seamlessly with Tailwind CSS through a custom plugin.

### What's Next?

Future releases will include:
- Additional crypt components
- Animation presets
- More SVG assets
- Theme customization utilities
- Expanded Web Audio library

[0.1.0]: https://github.com/yourusername/grave-cast/releases/tag/v0.1.0
