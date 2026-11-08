---
inclusion: auto
name: grave-ui-development
description: Enforces reusability principles and development patterns for the Grave-UI component library
---

# 🕯️ Grave-UI Development Rules

**Core Principle: Radical Reusability**

Every component, token, animation, and utility must be built for maximum reusability. This library serves both Gravecast and external consumers who will extend and compose these components.

---

## 1. Component Composition Rules

### ✅ DO: Build with Primitives
- **Always compose from primitives first** before creating new base components
- Use `<Card>`, `<Surface>`, `<IconButton>`, `<AnimatedGroup>` as building blocks
- If a pattern appears twice, extract it to a primitive

```tsx
// ✅ GOOD: Compose from primitives
export const TombstoneCard = ({ title, children }) => (
  <Card variant="elevated">
    <Surface texture="stone">
      <TombstoneHeader>{title}</TombstoneHeader>
      {children}
    </Surface>
  </Card>
);

// ❌ BAD: Reimplementing base patterns
export const TombstoneCard = ({ title, children }) => (
  <div className="rounded-lg shadow-lg bg-stone-800">
    <div className="p-4 border border-gray-700">
      <h3>{title}</h3>
      {children}
    </div>
  </div>
);
```

### ✅ DO: Export Sub-Components
- Compound components should export their parts
- Allow consumers to compose custom variants
- Use dot notation (Component.SubComponent)

```tsx
// ✅ GOOD: Compound component pattern
export const TombstoneCard = ({ children }) => { /* ... */ };
TombstoneCard.Header = TombstoneHeader;
TombstoneCard.Body = TombstoneBody;
TombstoneCard.Footer = TombstoneFooter;

// Usage allows flexibility:
<TombstoneCard>
  <TombstoneCard.Header>Custom Layout</TombstoneCard.Header>
  <TombstoneCard.Body>My content</TombstoneCard.Body>
</TombstoneCard>
```

### ✅ DO: Accept Children and Render Props
- Components should accept `children` when content can be customized
- Use render props for complex customization scenarios

```tsx
interface DrawerProps {
  children: ReactNode;
  trigger?: (props: TriggerProps) => ReactNode; // Optional custom trigger
}
```

---

## 2. Token Usage Requirements

### 🚫 NEVER: Hardcode Values
- **Zero inline colors, sizes, or animations**
- All values must reference the token system
- Use tokens even for one-off components (add to tokens if needed)

```tsx
// ❌ BAD: Hardcoded values
<div style={{ color: '#8a0303', padding: '16px', transition: 'all 0.3s' }}>

// ✅ GOOD: Token references
import { colors, spacing, animations } from 'grave-ui/tokens';
<div style={{ 
  color: colors.sanguine.blood, 
  padding: spacing.coven[4], 
  transition: animations.durations.creep 
}}>
```

### ✅ DO: Create Semantic Token Aliases
- Map archetype tokens to semantic names in components
- Makes refactoring easier and intent clearer

```tsx
// ✅ GOOD: Semantic mapping
const tombstoneColors = {
  base: colors.crypt.stone,
  accent: colors.crypt.moss,
  text: colors.bone.ivory,
} as const;
```

### ✅ DO: Use CSS Variables for Dynamic Values
- Expose tokens as CSS custom properties when runtime changes are needed
- Allow consumers to override without forking

```tsx
// ✅ GOOD: CSS variable approach
<div 
  style={{ 
    '--tombstone-moss-intensity': mossIntensity,
    backgroundColor: colors.crypt.stone 
  }}
  className="moss-overlay"
/>
```

---

## 3. Hook Extraction Guidelines

### ✅ DO: Extract Shared Logic to Hooks
- If behavior is used in 2+ components, create a hook
- Hooks live in `src/hooks/` and are exported via `grave-ui/hooks`
- Name hooks with `use` prefix and clear intent

```tsx
// ✅ GOOD: Reusable hook
// src/hooks/useHorrorHover.ts
export const useHorrorHover = (soundEffect?: SoundEffect) => {
  const [isHovered, setIsHovered] = useState(false);
  const { playSound } = useSpookyAudio();
  
  const hoverProps = {
    onMouseEnter: () => {
      setIsHovered(true);
      if (soundEffect) playSound(soundEffect);
    },
    onMouseLeave: () => setIsHovered(false),
  };
  
  return { isHovered, hoverProps };
};

// Usage in components:
const { isHovered, hoverProps } = useHorrorHover('stoneGrind');
```

### ✅ DO: Keep Hooks Pure and Composable
- Hooks should not have side effects beyond their stated purpose
- Multiple hooks should compose without conflicts
- Return objects, not arrays (for better naming flexibility)

```tsx
// ✅ GOOD: Composable hooks
const { isHovered, hoverProps } = useHorrorHover('stoneGrind');
const { isAnimating, startAnimation } = useAnimationState();
const isMobile = useMediaQuery('(max-width: 768px)');

// All work together without interference
```

### ✅ DO: Extract Animation Logic
- Component-specific animation state goes in dedicated hooks
- Keep animation keyframes in tokens, logic in hooks

```tsx
// ✅ GOOD: Animation hook
export const useTombstoneAnimation = (isHovered: boolean) => {
  const [fogOpacity, setFogOpacity] = useState(0);
  const [crackDepth, setCrackDepth] = useState(1);
  
  useEffect(() => {
    if (isHovered) {
      // Animate fog and cracks
    }
  }, [isHovered]);
  
  return { fogOpacity, crackDepth };
};
```

---

## 4. Prop Interface Standards

### ✅ DO: Export All Prop Interfaces
- Every component interface is exported from the component file
- Use clear naming: `ComponentNameProps`
- Document with JSDoc

```tsx
/**
 * Props for the TombstoneCard component.
 * 
 * @example
 * <TombstoneCard
 *   title="Here Lies..."
 *   mossIntensity={60}
 *   cracked
 * />
 */
export interface TombstoneCardProps {
  /** Main epitaph text displayed on the tombstone */
  title: string;
  /** Optional subtitle (dates, author, etc.) */
  subtitle?: string;
  /** Moss coverage intensity (0-100) */
  mossIntensity?: number;
  /** Whether the tombstone has cracks */
  cracked?: boolean;
  /** Style of the tombstone carving */
  carvingDepth?: 'shallow' | 'medium' | 'deep';
  /** Additional CSS classes */
  className?: string;
  /** Custom content */
  children?: ReactNode;
}
```

### ✅ DO: Use Discriminated Unions for Variants
- When props depend on each other, use discriminated unions
- TypeScript will enforce correct combinations

```tsx
// ✅ GOOD: Discriminated union
type LoaderProps = 
  | { mode: 'determinate'; progress: number }
  | { mode: 'indeterminate'; progress?: never };

// TypeScript enforces: determinate mode MUST have progress
```

### ✅ DO: Provide Sensible Defaults
- Use default parameters or default props
- Document defaults in JSDoc
- Prefer opt-in for audio and effects

```tsx
export const TombstoneCard = ({
  mossIntensity = 30, // Default to subtle moss
  cracked = false,
  carvingDepth = 'medium',
  ...props
}: TombstoneCardProps) => {
  // Implementation
};
```

---

## 5. No Magic Numbers Policy

### 🚫 NEVER: Use Raw Numbers
- All spacing, sizes, durations must be named constants
- Add to token system even for component-specific values

```tsx
// ❌ BAD: Magic numbers
<div style={{ width: 240, height: 180, transitionDuration: 300 }}>

// ✅ GOOD: Named constants from tokens
import { spacing, animations } from 'grave-ui/tokens';
<div style={{ 
  width: spacing.tombstone.width,
  height: spacing.tombstone.height,
  transitionDuration: animations.durations.creep
}}>
```

### ✅ DO: Create Component-Specific Token Extensions
- If a component needs unique values, extend tokens locally
- Keep in component folder, reference base tokens

```tsx
// src/components/crypt/TombstoneCard/tokens.ts
import { spacing, colors } from '../../../tokens';

export const tombstoneTokens = {
  sizes: {
    sm: { width: spacing.coven[48], height: spacing.coven[64] },
    md: { width: spacing.coven[64], height: spacing.coven[96] },
    lg: { width: spacing.coven[96], height: spacing.coven[128] },
  },
  depths: {
    shallow: '2px',
    medium: '4px',
    deep: '6px',
  },
  colors: {
    base: colors.crypt.stone,
    moss: colors.crypt.moss,
  },
} as const;
```

---

## 6. SVG and Asset Reusability

### ✅ DO: Create Generic SVG Components
- SVGs should be React components with standard props
- Use `currentColor` for fills/strokes to inherit theme
- Size via props, not hardcoded dimensions

```tsx
// ✅ GOOD: Reusable SVG component
interface SkullProps {
  size?: number | string;
  className?: string;
  color?: string;
}

export const Skull = ({ size = 24, className, color = 'currentColor' }: SkullProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    className={className}
    fill={color}
  >
    <path d="..." />
  </svg>
);
```

### ✅ DO: Create Filter Library Components
- SVG filters should be self-contained components
- Render in `<defs>`, reference by ID
- Export `<SpookyFilters>` wrapper

```tsx
// ✅ GOOD: Filter library
export const SpookyFilters = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id="stone-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" />
        <feColorMatrix values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.1 0" />
      </filter>
      <filter id="blood-drip">
        {/* Blood drip filter definition */}
      </filter>
    </defs>
  </svg>
);

// Usage: Apply via CSS
<div style={{ filter: 'url(#stone-texture)' }}>
```

---

## 7. Audio System Standards

### ✅ DO: Always Use the Hook
- Never call Web Audio API directly in components
- Use `useSpookyAudio()` hook exclusively
- Respect global mute state

```tsx
// ✅ GOOD: Using the hook
const { playSound, isEnabled } = useSpookyAudio();

const handleClick = () => {
  if (isEnabled) {
    playSound('boneClick');
  }
  // ... rest of handler
};
```

### ✅ DO: Make Audio Opt-In
- Audio should be disabled by default
- Provide clear UI to enable globally
- Individual components can have `soundEnabled` prop

```tsx
interface ComponentProps {
  soundEnabled?: boolean; // Overrides global setting
}

const Component = ({ soundEnabled = true }: ComponentProps) => {
  const { playSound, isEnabled } = useSpookyAudio();
  
  const shouldPlaySound = isEnabled && soundEnabled;
  // Use shouldPlaySound for conditional audio
};
```

---

## 8. Accessibility (Progressive Enhancement)

### ✅ DO: Start with Semantic HTML
- Use proper HTML elements (`button`, `nav`, `article`, etc.)
- Progressive enhancement means HTML works first

```tsx
// ✅ GOOD: Semantic base
<button type="button" onClick={...}>
  <Skull />
  <span className="sr-only">Open menu</span>
</button>

// ❌ BAD: Div soup
<div onClick={...}>
  <Skull />
</div>
```

### ✅ DO: Add ARIA in Dedicated Pass
- Build visuals first, then enhance with ARIA
- Document ARIA usage in component JSDoc
- Test with keyboard and screen reader

```tsx
// Accessibility pass adds:
<button
  type="button"
  aria-label="Open mausoleum drawer"
  aria-expanded={isOpen}
  aria-controls="drawer-content"
>
```

### ✅ DO: Provide Screen Reader Utilities
- Create reusable SR-only styles
- Use `useAriaAnnounce()` for dynamic updates

```tsx
// src/hooks/useAriaAnnounce.ts
export const useAriaAnnounce = () => {
  const announce = (message: string) => {
    // Create aria-live region and announce
  };
  return { announce };
};
```

---

## 9. File Organization Standards

### ✅ DO: Use Archetype Folders
- Mirror the brainstorm taxonomy in folder structure
- `src/components/crypt/`, `src/components/coven/`, etc.

```
src/
  components/
    primitives/      # Base components
      Card/
      Surface/
      IconButton/
    crypt/           # Graveyard archetype
      TombstoneCard/
      ExcavationLoader/
      MausoleumDrawer/
    coven/           # Witch archetype (future)
      CauldronSelect/
    index.ts         # Barrel exports
```

### ✅ DO: Component Folder Structure
- Each component gets a folder with:
  - `ComponentName.tsx` - Main component
  - `types.ts` - Props interfaces
  - `tokens.ts` - Component-specific tokens (if needed)
  - `index.ts` - Barrel export

```
TombstoneCard/
  TombstoneCard.tsx
  TombstoneHeader.tsx    # Sub-component
  TombstoneBody.tsx      # Sub-component
  types.ts
  tokens.ts
  index.ts
```

### ✅ DO: Barrel Exports at Every Level
- Each folder has `index.ts` that exports everything
- Enables clean imports: `import { Card } from 'grave-ui/primitives'`

---

## 10. Testing Philosophy

### ✅ DO: Use the Showcase as Primary Testing
- Build comprehensive interactive showcase
- Test visually with all prop combinations
- Manual testing is acceptable for MVP

### ✅ DO: Write Type Tests
- Use TypeScript to encode constraints
- Discriminated unions catch prop errors at compile time

```tsx
// Type test: This should not compile
<Loader mode="determinate" /> // ❌ Missing required progress prop
<Loader mode="determinate" progress={50} /> // ✅ Correct
```

### ✅ DO: Test Reusability by Using It
- Showcase should use Grave-UI components
- "Dogfooding" reveals reusability gaps
- If showcase needs to fork/modify components, extract that pattern

---

## 11. Documentation Standards

### ✅ DO: JSDoc Everything Public
- All exported components, hooks, functions get JSDoc
- Include `@example` blocks with usage
- Document prop defaults and edge cases

```tsx
/**
 * A weathered tombstone card component for displaying epitaphs.
 * 
 * Composes the Surface and Card primitives with stone texture
 * and optional moss/crack overlays.
 * 
 * @example
 * ```tsx
 * <TombstoneCard 
 *   title="Here Lies..." 
 *   subtitle="1847 - 1923"
 *   mossIntensity={60}
 *   cracked
 * />
 * ```
 * 
 * @example Custom composition
 * ```tsx
 * <TombstoneCard>
 *   <TombstoneCard.Header icon={<Skull />}>
 *     Custom Header
 *   </TombstoneCard.Header>
 *   <TombstoneCard.Body>
 *     Your content here
 *   </TombstoneCard.Body>
 * </TombstoneCard>
 * ```
 */
export const TombstoneCard = ({ ... }: TombstoneCardProps) => {
  // Implementation
};
```

### ✅ DO: Create Composition Guides
- Document how to compose custom components
- Show examples of extending the library
- Composition patterns guide in `/docs`

---

## 12. Build and Export Standards

### ✅ DO: Sub-Path Exports
- Enable tree-shaking with granular imports
- Configure in `package.json` exports field

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./primitives": "./dist/components/primitives/index.js",
    "./hooks": "./dist/hooks/index.js",
    "./tokens": "./dist/tokens/index.js",
    "./crypt": "./dist/components/crypt/index.js"
  }
}
```

### ✅ DO: Peer Dependencies
- React and React-DOM should be peer dependencies
- Let consumers control versions
- Document minimum supported versions

---

## Checklist for New Components

Before considering a component "done", verify:

- [ ] **Composition**: Built from primitives or justified as new primitive
- [ ] **Tokens**: Zero hardcoded values, all reference token system
- [ ] **Hooks**: Shared logic extracted to reusable hooks
- [ ] **Props**: Interface exported, documented with JSDoc, sensible defaults
- [ ] **Sub-components**: Complex components export their parts
- [ ] **SVG Assets**: Reuses existing SVGs or adds new reusable ones
- [ ] **Audio**: Uses `useSpookyAudio()` hook, opt-in behavior
- [ ] **Semantic HTML**: Proper element types (`button`, not `div`)
- [ ] **TypeScript**: Full type coverage, no `any`
- [ ] **Documentation**: JSDoc with examples, usage patterns
- [ ] **Showcase**: Added to interactive showcase with all props testable
- [ ] **Exports**: Added to barrel exports, accessible via sub-path

---

## When to Create vs. Compose

### Create a New Primitive When:
- Pattern will be used in 3+ components
- It handles a foundational UI concern (layout, interaction, etc.)
- Current primitives can't compose to achieve it cleanly

### Create a Custom Hook When:
- Logic is used in 2+ components
- Behavior is complex enough to need state/effects
- It encapsulates a single clear responsibility

### Create a New Token When:
- Value is used in 2+ places
- It's a semantic design decision (not arbitrary)
- It helps maintain visual consistency

### Compose from Existing When:
- You can achieve it with 2-3 existing primitives
- No new shared behavior is needed
- Component is archetype-specific (not cross-cutting)

---

## Philosophy: Teach Reusability

This library should teach users how to build reusable component systems:

- **Primitives show atomic design principles**
- **Compound components show flexible APIs**
- **Hooks show behavior extraction**
- **Tokens show design system thinking**
- **Sub-path exports show architecture scalability**

Every component is both a useful UI element AND an educational example of reusable patterns.

---

**Remember**: If someone wants to build a custom "vampire coffin card", they should be able to do it by composing `<Card>`, `<Surface texture="velvet">`, and our SVG assets — without touching our source code.

That's the measure of success.
