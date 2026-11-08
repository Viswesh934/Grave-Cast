# 🎃 Groove UI

A horror-themed React component library with folklore-inspired design primitives for building spooky, atmospheric user interfaces.

[![npm version](https://img.shields.io/npm/v/groove-ui.svg)](https://www.npmjs.com/package/groove-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🌙 **Dark, atmospheric components** inspired by horror and folklore
- 🎨 **Complete design token system** for consistent theming
- 🔧 **Tailwind CSS integration** via custom plugin
- ♿ **Accessible** following WCAG guidelines
- 📦 **Tree-shakeable** with modular exports
- 🎭 **TypeScript support** with full type definitions
- 🎵 **Web Audio utilities** for atmospheric soundscapes

## Installation

```bash
npm install groove-ui
```

### Peer Dependencies

```bash
npm install react react-dom tailwindcss
```

## Quick Start

### 1. Configure Tailwind

Add the Groovy plugin to your `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';
import groovyPlugin from 'groove-ui/tailwind';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/groove-ui/dist/**/*.js'
  ],
  plugins: [groovyPlugin]
} satisfies Config;
```

### 2. Import Components

```tsx
import { Button, Card, TombstoneCard } from 'groove-ui';

function App() {
  return (
    <div className="bg-grave-dark-900 min-h-screen p-8">
      <TombstoneCard
        title="Welcome to Groovy"
        subtitle="Horror-themed components"
        epitaph="Built with love and fear"
      />
      
      <Button variant="primary" size="md">
        Enter if you dare
      </Button>
    </div>
  );
}
```

## Component Library

### Primitives

Core building blocks for your interface:

- **Button** - Horror-themed button with multiple variants
- **Card** - Atmospheric card container
- **Badge** - Informational badges with folklore styling

```tsx
import { Button, Card, Badge } from 'groove-ui';

<Button variant="primary" size="lg">Primary Action</Button>
<Card>
  <Badge variant="warning">New</Badge>
  <p>Card content here</p>
</Card>
```

### Crypt Components

Advanced components with complex interactions:

- **TombstoneCard** - Ornate card with decorative elements
- **ExcavationLoader** - Atmospheric loading animation
- **MausoleumDrawer** - Sliding drawer with dark styling
- **BoneOssuaryDivider** - Decorative section divider
- **CoffinAccordion** - Expandable accordion with compound component API
- **SpectralPortal** - Advanced portal with render props pattern

```tsx
import { 
  TombstoneCard, 
  ExcavationLoader,
  MausoleumDrawer,
  CoffinAccordion 
} from 'groove-ui';

// Tombstone Card
<TombstoneCard
  title="Rest in Peace"
  subtitle="Here lies a soul"
  epitaph="Forever in our memories"
  onEpitaphClick={() => console.log('Epitaph clicked')}
/>

// Excavation Loader
<ExcavationLoader size="md" speed="normal" />

// Mausoleum Drawer
<MausoleumDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Drawer Title"
>
  <p>Drawer content</p>
</MausoleumDrawer>

// Coffin Accordion (Compound Components)
<CoffinAccordion>
  <CoffinAccordion.Item value="section1">
    <CoffinAccordion.Trigger>Section 1</CoffinAccordion.Trigger>
    <CoffinAccordion.Content>Content for section 1</CoffinAccordion.Content>
  </CoffinAccordion.Item>
</CoffinAccordion>

// Spectral Portal (Render Props)
<SpectralPortal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  render={({ portalProps, backdropProps, contentProps }) => (
    <div {...portalProps}>
      <div {...backdropProps} />
      <div {...contentProps}>Portal content</div>
    </div>
  )}
/>
```

## Hooks

Custom React hooks for common patterns:

```tsx
import { 
  useHorrorHover, 
  useAnimationState,
  useMediaQuery,
  useThemeToken 
} from 'groove-ui/hooks';

// Horror hover effects
const { isHovered, handlers } = useHorrorHover({
  onHoverStart: () => console.log('hover started'),
  onHoverEnd: () => console.log('hover ended')
});

// Animation state management
const { isAnimating, startAnimation, stopAnimation } = useAnimationState();

// Responsive design
const isMobile = useMediaQuery('(max-width: 768px)');

// Access theme tokens
const shadowValue = useThemeToken('shadows', 'crypt');
```

## Design Tokens

Access the complete token system:

```tsx
import { colors, shadows, typography, animations, spacing } from 'groove-ui/tokens';

const customComponent = {
  color: colors.grave.crimson[500],
  boxShadow: shadows.cryptic.ethereal,
  fontSize: typography.fontSize.tome,
  animation: `${animations.easing.haunted} ${animations.duration.creep}`,
  padding: spacing.cryptSize.tombstone
};
```

### Available Token Categories

- **Colors**: Grave palette (dark, bone, crimson, moss, mist)
- **Shadows**: Crypt shadows (ethereal, haunted, cursed, forbidden)
- **Typography**: Folklore-inspired sizes and families
- **Animations**: Easing functions and durations
- **Spacing**: Crypt-sized spacing scale

## SVG Assets

Pre-built SVG components with folklore themes:

```tsx
import { Skull, Coffin, Cross, Headstone, Bone } from 'groove-ui';

<Skull size={48} />
<Coffin size={64} />
<Cross size={32} />
```

All SVGs support:
- Customizable `size` prop
- Inherits `currentColor` for easy theming
- Fully accessible with ARIA attributes

## Web Audio

Create atmospheric soundscapes:

```tsx
import { AudioProvider, useAudio } from 'groove-ui';

function App() {
  return (
    <AudioProvider>
      <YourComponents />
    </AudioProvider>
  );
}

function YourComponent() {
  const { playSound, stopSound, setVolume } = useAudio();
  
  const handleClick = async () => {
    await playSound('/sounds/creak.mp3', { 
      loop: false, 
      volume: 0.5 
    });
  };
  
  return <button onClick={handleClick}>Play Sound</button>;
}
```

## Advanced Patterns

### Compound Components

CoffinAccordion demonstrates the compound component pattern:

```tsx
<CoffinAccordion>
  <CoffinAccordion.Item value="item1">
    <CoffinAccordion.Trigger>Click me</CoffinAccordion.Trigger>
    <CoffinAccordion.Content>Hidden content</CoffinAccordion.Content>
  </CoffinAccordion.Item>
</CoffinAccordion>
```

### Render Props

SpectralPortal uses render props for maximum flexibility:

```tsx
<SpectralPortal
  isOpen={isOpen}
  render={({ portalProps, backdropProps, contentProps }) => (
    <CustomPortalImplementation 
      portal={portalProps}
      backdrop={backdropProps}
      content={contentProps}
    />
  )}
/>
```

## TypeScript

All components are fully typed. Import types from the main package:

```tsx
import type { ButtonProps, CardProps, TombstoneCardProps } from 'groove-ui';

const customButton: ButtonProps = {
  variant: 'secondary',
  size: 'lg',
  children: 'Click me'
};
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT © Gravecast Team

## Links

- [GitHub Repository](https://github.com/yourusername/grave-cast)
- [Issue Tracker](https://github.com/yourusername/grave-cast/issues)
- [npm Package](https://www.npmjs.com/package/groove-ui)

---

Built with 🖤 for the dark side of design

