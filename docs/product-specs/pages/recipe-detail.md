# Recipe detail

View one recipe while cooking: scaled ingredients, steps, source link, print.

**Route:** `/recipes/:slug`  
**ID prefix:** `RD-`

---

## Primary code

| Area | Path |
| ---- | ---- |
| Page | `src/pages/RecipeDetailPage/RecipeDetailPage.tsx` |

---

## API dependencies

| Operation | Spec | Role |
| --------- | ---- | ---- |
| `getRecipeBySlug` | [recipes-catalog](../../api-specs/loaders/recipes-catalog.md) | Single recipe |

---

## Features

| ID | Feature | Status | Tests |
| -- | ------- | ------ | ----- |
| RD-1 | Recipe header + image | complete | `recipeImageUrl.test.ts` |
| RD-2 | Servings scale on ingredients | complete | `scaleIngredient.test.ts` |
| RD-3 | Steps list | complete | — |
| RD-4 | Source URL link | complete | `catalog.test.ts` |
| RD-5 | Print layout | complete | — |
