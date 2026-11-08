---
inclusion: auto
name: content-guidelines
description: Guidelines for user-facing content in Gravecast applications
---

# Content Guidelines for Gravecast

**Purpose:** Prevent technical jargon and AI patterns from bleeding into user-facing content.

## ❌ AVOID These Patterns

### Technical Architecture Terms
- "Radical reusability"
- "Token-driven"
- "Primitive composition"
- "Compound component pattern"
- "Render props"
- "Context API"
- "Advanced patterns"

### Implementation Details
- "Built with TypeScript"
- "Uses React hooks"
- "Leverages design tokens"
- "Implements X pattern"

### AI-Generated Phrases
- "Leverages..."
- "Utilizes..."
- "Implements..."
- "Facilitates..."
- "Enables seamless..."

## ✅ USE Instead

### Focus on User Benefits
- **Not:** "Radical reusability through token-driven architecture"
- **Yes:** "Mix and match to build exactly what you need"

### Plain Language
- **Not:** "Compound component pattern with context sharing"
- **Yes:** "Flexible components that work together"

### Show, Don't Tell
- **Not:** "Advanced TypeScript integration"
- **Yes:** Show type-safe code examples

## User-Facing Content Rules

1. **Benefits over features**: What can users DO, not how it works
2. **Concrete over abstract**: "Add dark cards" not "Leverage primitive composition"
3. **Active voice**: "Build scary UIs" not "Facilitates scary UI creation"
4. **No meta-commentary**: Don't talk about the code, show the result

## Examples

### ❌ Bad Footer
```
Built with radical reusability • Token-driven design system • Advanced TypeScript patterns
```

### ✅ Good Footer
```
Built for Gravecast • Horror-themed components • Open source
```

### ❌ Bad Feature Description
```
Leverages compound component patterns for maximum flexibility
```

### ✅ Good Feature Description
```
Combine components to match your design
```

## Testing for Prompt Bleeding

Ask: **"Would a designer/user understand this, or only a React developer?"**

If only developers understand it, rewrite it.

## Marketing Copy Guidelines

- **Taglines:** Short, punchy, memorable
- **Features:** User outcomes, not implementation
- **Examples:** Real use cases, not architecture diagrams
- **CTAs:** Clear actions ("Try it", "Get started"), not "Leverage our SDK"

## When Technical Terms ARE Appropriate

- API documentation
- README installation instructions
- TypeScript type definitions
- Developer-focused tutorials

**User-facing showcase = Zero jargon**
