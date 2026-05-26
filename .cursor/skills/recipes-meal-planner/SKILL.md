---
name: recipes-meal-planner
description: >-
  Starred cook queue and meal-type tags on recipes. Use when changing the starred
  queue, starred order, or tagging recipes for breakfast/lunch/dinner/etc.
---

# Starred cook queue & meal types

## Meal types (required on every recipe)

Each catalog recipe must have `mealTypes`: one or more of:

| Value | Use for |
| ----- | ------- |
| `breakfast` | Morning / brunch dishes |
| `lunch` | Midday mains, sandwiches, light bowls |
| `dinner` | Evening mains (most entrees) |
| `side` | Salads, breads, rice, veg sides |
| `snack` | Apps, bites, dips, small plates |
| `dessert` | Sweets |

**Multiple values are OK** (e.g. `["lunch", "dinner"]` for a soup).

### When importing or editing a recipe

1. Set `mealTypes` on the JSON row in `src/static-api/data/recipes.json`
2. Prefer explicit tags over inference — heuristics live in `src/static-api/mealTypes.ts`
3. After bulk changes, run:

```bash
npm run tag:meal-types   # re-infer all rows (overwrites mealTypes)
npm run sync:recipes-data
```

### Checklist (add to import completion)

- [ ] `mealTypes` reflects how the family would use this recipe
- [ ] At least one type; mains usually `["lunch", "dinner"]`
- [ ] Desserts/snacks never tagged only as `dinner` unless intentional

## Starred queue behavior

| Topic | Detail |
| ----- | ------ |
| Route | `/starred` (`/planner` redirects) |
| Storage | `localStorage` `recipes-starred-v1` — ordered slug array |
| UI | Nav **Starred** tab; **Queue** + **Ingredients** plan tabs |
| Reorder | Drag rows on Queue tab |
| Shopping list | Ingredients tab merges queue recipes; groups by name; shows recipe usage |
| Star toggle | Appends new stars to end of queue |

## Code map

| Area | Path |
| ---- | ---- |
| Page spec | `docs/product-specs/pages/planner.md` |
| Order / toggle | `src/features/starred-recipes/starredRecipes.ts` |
| UI | `src/features/starred-queue/StarredQueue.tsx` |
| Meal types | `src/static-api/mealTypes.ts` |

## Tests

```bash
npm run test -- starred-queue starredRecipes mealTypes
```

## Related

- **recipes-import-recipe** — add `mealTypes` to import checklist
- **recipes-static-api** — schema in `docs/api-specs/data/recipes-schema.md`
