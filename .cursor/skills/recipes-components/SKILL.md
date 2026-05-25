---
name: recipes-components
description: >-
  Component-first design for the recipes React app — layers, composition, props,
  and file structure. Use when building UI, splitting components, or deciding
  page vs feature vs shared component boundaries.
---

# Recipes component-first design

**Bottom-up:** primitives → shared components → features → thin pages.

## Layer diagram

```
design-system/primitives     ← no recipe domain
        ↓
src/components               ← recipe UI, reusable across pages
        ↓
src/features/<name>          ← optional multi-step flows
        ↓
src/pages                    ← wire router + data loaders, minimal JSX
```

## Decision tree

| Question | Answer |
|----------|--------|
| Generic button/text/layout? | `design-system/primitives` |
| Shows recipe fields, used on 2+ pages? | `src/components` |
| Single-page-only widget? | `src/pages/<Page>/components/` |
| Coordinates state across several components? | `src/features/<name>/` |

## Component file contract

```
RecipeCard/
  RecipeCard.tsx
  RecipeCard.module.css      # layout only; colors from tokens via primitives
  RecipeCard.test.tsx
  index.ts                   # export { RecipeCard } from './RecipeCard'
```

## Props

- Prefer **data props** (`recipe: Recipe`) over many scalar props
- No `fetch` inside presentational components — parents/pages pass data
- Callback props named `onVerb`: `onSelect`, `onTagClick`
- Optional `className` only on leaf wrappers if needed for layout grids

## Composition example

```tsx
// Good — composes primitives
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card>
      <Image src={recipe.imageUrl} alt="" />
      <Text as="h2">{recipe.title}</Text>
      <RecipeMeta recipe={recipe} />
    </Card>
  );
}
```

```tsx
// Bad — duplicates primitive markup, inline styles
export function RecipeCard({ recipe }) {
  return (
    <div style={{ padding: 12, borderRadius: 8 }}>
      <h2 style={{ color: '#333' }}>{recipe.title}</h2>
    </div>
  );
}
```

## Page components stay thin

```tsx
// pages/RecipeDetailPage/RecipeDetailPage.tsx
export function RecipeDetailPage() {
  const { slug } = useParams();
  const recipe = useRecipe(slug); // hook wraps static loader
  if (!recipe) return <NotFound />;
  return <RecipeDetail recipe={recipe} />;
}
```

Logic for loading/filtering lives in hooks or loaders, not in page JSX trees.

## TDD order for a screen

1. Test loader/hook (static API skill)
2. Test leaf: `IngredientList`, `StepList`
3. Test composite: `RecipeDetail`
4. Test page: route renders detail for known slug (router wrapper)
5. Implement bottom-up until green

## Splitting triggers

Extract a new component when:

- Markup block exceeds ~40 lines or repeats twice
- A section has its own testable behaviors
- A primitive is being misused to simulate a domain widget

Do **not** extract one-off div wrappers with no behavior.
