# Changelog

All notable changes to Groovy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- **Package name**: `@gravecast/groovy`
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
