---
name: recipes-design-system
description: >-
  Design system for the recipes app — tokens, primitives, theming, and CSS
  module rules. Use when styling UI, adding buttons/cards/typography, or
  preventing one-off styles in feature code.
---

# Recipes design system

Feature and page code **must** compose primitives. Raw visual values belong only in tokens.

## Structure

```
src/design-system/
  tokens/
    colors.css
    spacing.css
    typography.css
    radii.css
    shadows.css
    index.css          # @import all tokens
  primitives/
    Text/
    Button/
    Stack/
    Card/
    Image/
    Badge/
  ThemeProvider.tsx      # optional: data-theme on <html>
```

## Tokens

Define CSS custom properties on `:root` (and `[data-theme="dark"]` if needed):

```css
/* tokens/spacing.css */
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius-md: 0.5rem;
  --color-surface: #fff;
  --color-text: #1a1a1a;
  --font-size-body: 1rem;
}
```

Primitives reference **only** `var(--*)` — never `#hex` or `16px` literals in primitive CSS.

## Primitive rules

Each primitive:

- Own folder: `Button/Button.tsx`, `Button.module.css`, `Button.test.tsx`
- Typed props with narrow variants (`variant: 'primary' | 'ghost'`)
- Accessible by default (`<button type="button">`, heading levels, `alt` on images)
- Documented variants in tests (one test per variant that changes visible output)

## Recipe-specific primitives

Build domain-agnostic shells first, then thin wrappers if needed:

| Primitive | Recipe usage |
|-----------|----------------|
| `Card` | Recipe list tiles |
| `Badge` | Tags, difficulty |
| `Text` | Titles, meta lines |
| `Stack` | Ingredient lists, step layout |

Domain copy stays in `src/components/` (e.g. `RecipeMeta` uses `Text` + `Badge`).

## Adding a new primitive (TDD)

1. Test: renders children, keyboard focus, variant class **via role/label** not `.className`
2. Implement with tokens
3. Export from `src/design-system/primitives/index.ts`

## Feature code check

Before merging UI:

- [ ] No new hex/rgb/hsl in `components/`, `features/`, `pages/`
- [ ] No duplicate button/card markup — use primitives
- [ ] Focus states visible on interactive elements

## Theming

Prefer `data-theme` + token overrides. Avoid hard-coded dark-mode duplicates in feature CSS.
