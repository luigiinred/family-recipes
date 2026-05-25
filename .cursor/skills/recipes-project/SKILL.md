---
name: recipes-project
description: >-
  Recipes React app conventions — static API, design system, component-first
  layout, and TDD. Use when bootstrapping, adding features, or unsure where code
  belongs in the recipes repository.
---

# Recipes project

Read [docs/architecture.md](../../../docs/architecture.md) for diagrams and layer rules.

## Stack

- React + TypeScript + Vite
- Vitest + React Testing Library
- Static JSON API under `src/static-api/`
- CSS modules + design tokens (no ad-hoc hex/spacing in features)

## Bootstrap checklist

When the repo has no app yet:

1. `npm create vite@latest . -- --template react-ts` (or equivalent in empty dir)
2. Add Vitest, RTL, user-event, jsdom
3. Create folder skeleton from architecture doc
4. Add `src/design-system/tokens.css` before any feature UI
5. Seed `src/static-api/data/recipes.json` + loader tests

## File placement

| You are building… | Location |
|-------------------|----------|
| Color, spacing, type scale | `src/design-system/tokens/` |
| Button, Text, Stack, Card shell | `src/design-system/primitives/` |
| RecipeCard, IngredientList | `src/components/` |
| Search or filter flow | `src/features/<name>/` |
| Route screen | `src/pages/<Name>/` |
| JSON + `getRecipeBySlug` | `src/static-api/` |

## Naming

- Components: `PascalCase.tsx` + `PascalCase.test.tsx` beside it
- Loaders: `camelCase.ts` + `camelCase.test.ts`
- CSS modules: `ComponentName.module.css`
- Tests describe **behavior**, not implementation: `it('shows prep time when recipe has prepMinutes')`

## Related skills

- TDD workflow → [recipes-tdd](../recipes-tdd/SKILL.md)
- Tokens and primitives → [recipes-design-system](../recipes-design-system/SKILL.md)
- Component layers → [recipes-components](../recipes-components/SKILL.md)
- JSON and loaders → [recipes-static-api](../recipes-static-api/SKILL.md)
