# Feature catalog

Personal family recipe site — static JSON catalog + React UI.

## Pages

| ID | Name | User outcome | Status | Page spec | Tests |
| -- | ---- | ------------ | ------ | --------- | ----- |
| HM-1 | Recipe grid | See all recipes | complete | [home](product-specs/pages/home.md) | [HomePage.test.tsx](src/pages/HomePage/HomePage.test.tsx) |
| HM-2 | Search | Find recipes by text | complete | home | [filterRecipes.test.ts](../src/features/search/filterRecipes.test.ts) |
| HM-3 | Tag filter | Filter with autocomplete | complete | home | [TagFilter.test.tsx](../src/components/TagFilter/TagFilter.test.tsx) |
| HM-4 | Meal lists | Filter to-make, saved, etc. | complete | home | filterRecipes |
| HM-6 | Low effort | Filter quick recipes (`effort: low`) | complete | home | filterRecipes, catalog |
| HM-7 | Star recipes | Mark favorites; persisted locally | complete | home | [RecipeCard.test.tsx](../src/components/RecipeCard/RecipeCard.test.tsx), [starredRecipes.test.ts](../src/features/starred-recipes/starredRecipes.test.ts) |
| RD-1 | Recipe detail | Cook one recipe | complete | [recipe-detail](product-specs/pages/recipe-detail.md) | catalog + scaleIngredient |
| RD-5 | Print recipe | Print-friendly view | complete | recipe-detail | — |
| RD-6 | Video recipe | YouTube embed + seekable steps | complete | recipe-detail | RecipeDetailPage + TimedRecipeSteps tests |
| RD-7 | Sticky video player | Video stays visible while scrolling steps | complete | recipe-detail | — |
| RD-8 | Timestamp autoplay | Embed autoplays after step seek | complete | recipe-detail | RecipeDetailPage + YouTubeRecipePlayer tests |
| RD-9 | Star recipe | Toggle favorite from detail page | complete | recipe-detail | RecipeDetailPage + starredRecipes tests |
| TG-1 | Tags browse | Explore by tag | complete | [tags](product-specs/pages/tags.md) | — |
| PL-1 | Weekly planner | Plan meals for the week | complete | [planner](product-specs/pages/planner.md) | [weeklyPlan.test.ts](../src/features/meal-planner/weeklyPlan.test.ts) |

## Static API

| ID | Name | User outcome | Status | API spec | Tests |
| -- | ---- | ------------ | ------ | -------- | ----- |
| CAT-API-1 | Recipe catalog | Load all recipes | complete | [recipes-catalog](api-specs/loaders/recipes-catalog.md) | [catalog.test.ts](../src/static-api/loaders/catalog.test.ts) |
| CAT-API-4 | Meal lists | Filter by list membership | complete | recipes-catalog | catalog |
| CAT-API-5 | Search | Query catalog | complete | — | [searchRecipes.test.ts](../src/static-api/loaders/searchRecipes.test.ts) |
| CAT-API-6 | All tags | Tag index | complete | — | [getAllTags.test.ts](../src/static-api/loaders/getAllTags.test.ts) |
| CAT-API-7 | YouTube recipes | `recipeKind` + `timedSteps` | complete | [recipes-schema](api-specs/data/recipes-schema.md) | catalog + parseYouTubeVideoId |
| CAT-API-7 | Effort filter | Recipes by `effort` field | complete | recipes-catalog | catalog |

## Meal list counts

| List | Recipes |
| ---- | ------- |
| to-make | 7 |
| to-eat | 1 |
| healthy-ideas | 7 |
| saved | 20 |
| freezer-meals | 1 |

Regenerate data: `node scripts/build-recipes-catalog.mjs`

## Run

```bash
npm run dev
npm run test:run
npm run build
```
