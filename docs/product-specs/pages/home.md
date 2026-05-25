# Home — recipe catalog

Browse and search the full personal recipe catalog with meal-list and tag filters.

**Route:** `/`  
**ID prefix:** `HM-`

---

## Primary code

| Area | Path |
| ---- | ---- |
| Page | `src/pages/HomePage/HomePage.tsx` |

---

## Component dependencies

| Component | Role |
| --------- | ---- |
| `RecipeSearch` | Full-text query |
| `TagFilter` | Tag autocomplete (`datalist`) |
| `TagPicker` | Quick tag chips |
| `RecipeCard` | Grid tiles |

---

## API dependencies

| Operation | Spec | Role |
| --------- | ---- | ---- |
| `getRecipes` | [recipes-catalog](../../api-specs/loaders/recipes-catalog.md) | Catalog load |
| `getAllTags` | — | Tag suggestions |

---

## Features

| ID | Feature | Status | Tests |
| -- | ------- | ------ | ----- |
| HM-1 | Recipe grid | complete | `HomePage.test.tsx` |
| HM-2 | Full-text search | complete | `HomePage.test.tsx`, `filterRecipes.test.ts` |
| HM-3 | Tag filter with autocomplete | complete | `TagFilter.test.tsx` |
| HM-4 | Meal list filters | complete | `filterRecipes.test.ts` |
| HM-5 | Quick tag chips (incl. vegetarian) | complete | `HomePage.test.tsx`, `tags.test.ts` |
| HM-6 | Low effort filter | Show only `effort: low` recipes | complete | `filterRecipes.test.ts`, `HomePage.test.tsx` |
| HM-7 | Star recipes | Toggle starred state on card hover; persisted in localStorage | complete | `RecipeCard.test.tsx`, `starredRecipes.test.ts` |
