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
| RD-6 | YouTube embed + timestamped steps | complete | [RecipeDetailPage.test.tsx](../../../src/pages/RecipeDetailPage/RecipeDetailPage.test.tsx), [TimedRecipeSteps.test.tsx](../../../src/components/TimedRecipeSteps/TimedRecipeSteps.test.tsx) |
| RD-7 | Sticky video player while scrolling steps | complete | — |
| RD-8 | Autoplay embed after timestamp seek | complete | [RecipeDetailPage.test.tsx](../../../src/pages/RecipeDetailPage/RecipeDetailPage.test.tsx), [YouTubeRecipePlayer.test.tsx](../../../src/components/YouTubeRecipePlayer/YouTubeRecipePlayer.test.tsx) |
| RD-9 | Star recipe | Toggle starred state from detail header; synced with card stars via localStorage | complete | [RecipeDetailPage.test.tsx](../../../src/pages/RecipeDetailPage/RecipeDetailPage.test.tsx), [starredRecipes.test.ts](../../../src/features/starred-recipes/starredRecipes.test.ts) |
