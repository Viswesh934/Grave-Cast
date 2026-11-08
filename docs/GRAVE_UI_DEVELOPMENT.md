# 🕯️ Grave-UI Development Guide

> **Horror-themed component library with radical reusability at its core**

## Quick Start

Grave-UI is being developed in `packages/grave-ui` as a standalone, publishable component library that powers the Gravecast frontend and can be used by others.

## Core Principle: Radical Reusability

**Everything is built for composition and extension.**

- Primitives compose into complex components
- Hooks extract shared behavior
- Tokens drive all styling
- Sub-components enable custom layouts
- Zero hardcoded values

## Development Rules

See [`.kiro/steering/grave-ui-rules.md`](../.kiro/steering/grave-ui-rules.md) for comprehensive development standards.

**Key highlights:**

1. **Compose from primitives** - Don't reinvent base patterns
2. **Extract to hooks** - Shared logic becomes reusable hooks
3. **Reference tokens** - No inline colors, sizes, or magic numbers
4. **Export sub-components** - Enable custom compositions
5. **Document with JSDoc** - Every public API gets examples
6. **Progressive a11y** - Semantic HTML first, ARIA in refinement pass

## Kiro Automation

Two hooks enforce these standards:

- **Reusability Guard** (`PreToolUse`) - Checks file writes for hardcoded values, token usage, and composition patterns
- **Auto-load Rules** (`SessionStart`) - Loads development rules at the start of each session

These hooks will catch violations and suggest refactoring to align with reusability principles.

## Architecture

```
packages/grave-ui/
  src/
    components/
      primitives/     # Base reusable components
      crypt/          # Graveyard archetype components
      coven/          # Witch archetype (future)
      # ... other archetypes
    tokens/           # Design system tokens
    hooks/            # Reusable behavior hooks
    audio/            # Web Audio API sound engine
    assets/           # SVG primitives and filters
    utils/            # Pure utility functions
```

## Import Strategy

Granular sub-path imports for tree-shaking:

```tsx
// Full components
import { TombstoneCard, ExcavationLoader } from 'grave-ui';

// Just primitives
import { Card, Surface } from 'grave-ui/primitives';

// Just hooks
import { useHorrorHover, useMediaQuery } from 'grave-ui/hooks';

// Just tokens
import { colors, animations } from 'grave-ui/tokens';

// Tailwind preset
import graveUIPreset from 'grave-ui/tailwind';
```

## Development Workflow

### Phase 1: Foundations (Current)
Build the infrastructure that all components depend on:
- Token system (colors, typography, animations, spacing)
- SVG asset library (reusable primitives)
- Audio engine (Web Audio API synthesis)
- Core hooks (hover, animation, media query)
- Primitive components (Card, Surface, IconButton, AnimatedGroup)

### Phase 2: Crypt Components (Gravecast MVP)
Build the Graveyard archetype using foundations:
- TombstoneCard
- ExcavationLoader
- MausoleumDrawer
- BoneOssuaryDivider

### Phase 3: Showcase & Integration
- Interactive component browser in web app
- Sidebar navigation by archetype
- Live prop controls and code snippets
- "Dogfooding" reveals reusability gaps

## Testing Philosophy

**Minimal/Manual via Showcase:**
- Primary testing is the interactive showcase
- Visual verification with all prop combinations
- TypeScript provides type safety
- Manual keyboard/screen reader testing for a11y

**Reusability Test:**
- If the showcase needs to fork a component, that pattern should be extracted
- The library "eats its own dog food"

## Quality Standards

### Composition
- ✅ Built from primitives
- ✅ Sub-components exported
- ✅ Accepts children/render props

### Tokens
- ✅ Zero hardcoded values
- ✅ All styling via token system
- ✅ Component-specific tokens extend base

### Hooks
- ✅ Shared logic extracted
- ✅ Pure and composable
- ✅ Named with clear intent

### Props
- ✅ Interfaces exported and documented
- ✅ JSDoc with examples
- ✅ Sensible defaults

### Accessibility
- ✅ Semantic HTML elements
- ✅ Keyboard navigation
- ✅ ARIA labels where needed
- ✅ Focus management

## Reusability Checklist

Before considering a component "done":

- [ ] Composed from existing primitives (or justified as new primitive)
- [ ] Zero hardcoded colors, sizes, or durations
- [ ] Shared logic extracted to hooks
- [ ] Prop interface exported with JSDoc
- [ ] Sub-components exported for custom layouts
- [ ] Uses existing SVG assets or adds reusable ones
- [ ] Audio via `useSpookyAudio()` hook (opt-in)
- [ ] Semantic HTML (proper button/nav/etc elements)
- [ ] Full TypeScript coverage
- [ ] Added to showcase with interactive controls
- [ ] Included in barrel exports

## Philosophy

This library teaches reusable component design:

- **Primitives** demonstrate atomic design
- **Compound components** show flexible APIs
- **Hooks** show behavior extraction
- **Tokens** show design system thinking
- **Sub-path exports** show scalable architecture

**Success metric:** Can someone build a custom "vampire coffin card" by composing our primitives without touching our source code?

## Resources

- [Brainstorm Doc](c:\Users\S VISWESH\.gemini\antigravity\brain\ad10fadb-d09d-4c92-9cdc-7fa649dbdaab\spooky_ui_brainstorm.md) - Original vision and taxonomy
- [Grave-UI Rules](../.kiro/steering/grave-ui-rules.md) - Comprehensive development standards
- [Build Spec](./BUILD_SPEC.md) - Gravecast product specification

---

**Remember:** Every component is both a useful UI element AND an educational example of reusable design patterns.
