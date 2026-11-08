# Kiro Configuration for Grave-Cast

This directory contains Kiro IDE automation and development guidance for the Grave-Cast project.

## Structure

```
.kiro/
  steering/              # Development rules and guidelines
    grave-ui-rules.md   # Comprehensive reusability standards for Grave-UI library
  hooks/                 # Automated workflow hooks
    grave-ui-reusability-check.json   # PreToolUse: Enforces reusability standards
    grave-ui-auto-load.json           # SessionStart: Auto-loads rules
  README.md             # This file
```

## Active Hooks

### 1. Grave-UI Reusability Guard
**Trigger:** `PreToolUse` (before file writes/edits)  
**Target:** Files in `packages/grave-ui`  
**Purpose:** Enforces reusability principles by checking for:
- Hardcoded values (colors, sizes, magic numbers)
- Token system usage
- Component composition from primitives
- Hook extraction patterns
- Prop interface standards

### 2. Auto-load Grave-UI Rules
**Trigger:** `SessionStart`  
**Purpose:** Automatically loads the Grave-UI development rules at the beginning of each session to ensure consistency in library development.

## Steering Files

### grave-ui-rules.md
Comprehensive development standards for the Grave-UI horror component library. Covers:
- Component composition patterns
- Token usage requirements
- Hook extraction guidelines
- Prop interface standards
- No magic numbers policy
- SVG asset reusability
- Audio system standards
- Progressive accessibility approach
- File organization
- Testing philosophy
- Documentation standards

**Key Principle:** Radical Reusability - Every component, hook, and token must be built for maximum composition and extension.

## Usage

### For Developers
1. Read [`docs/GRAVE_UI_DEVELOPMENT.md`](../docs/GRAVE_UI_DEVELOPMENT.md) for quick start
2. Review [`steering/grave-ui-rules.md`](steering/grave-ui-rules.md) for detailed standards
3. Hooks will automatically enforce rules during development

### For Kiro
- Rules are auto-loaded at session start
- PreToolUse hooks catch violations before they're written
- Steering files provide context for all Grave-UI work

## Development Philosophy

**Grave-UI is built to teach reusability:**
- Primitives demonstrate atomic design
- Compound components show flexible APIs
- Hooks show behavior extraction
- Tokens show design system thinking
- Sub-path exports show scalable architecture

**Success Metric:** Can someone build a custom component (like a "vampire coffin card") by composing our primitives without touching our source code?

## Disabling Hooks

If you need to temporarily disable hooks:

1. **Single session:** Rename the hook file with `.disabled` extension
2. **Permanent:** Delete the hook JSON file from `.kiro/hooks/`

## Adding New Rules

1. Update `steering/grave-ui-rules.md` with new standards
2. Modify hook prompts if enforcement needs to change
3. Document in `docs/GRAVE_UI_DEVELOPMENT.md`

---

**Note:** Hooks activate on next session start after creation/modification.
