# Feature catalog

Personal family recipe site — static JSON catalog + React UI.

## Pages

| ID | Name | User outcome | Status | Page spec | Tests |
| -- | ---- | ------------ | ------ | --------- | ----- |
| HM-1 | Recipe grid | See all recipes | complete | [home](product-specs/pages/home.md) | [HomePage.test.tsx](src/pages/HomePage/HomePage.test.tsx) |
| HM-2 | Search | Find recipes by text (nav bar); ideas when Quick ideas is on | complete | home | NavRecipeSearch, filterCatalog, filterRecipes |
| HM-11 | Food ideas on home | Quick eats (takeout, pantry, kid) in search grid | complete | home | [FoodIdeaCard.test.tsx](../src/components/FoodIdeaCard/FoodIdeaCard.test.tsx), filterCatalog |
| HM-3 | Tag filter | Quick + more tags in nav panel | complete | home | [NavRecipeSearch.test.tsx](../src/components/NavRecipeSearch/NavRecipeSearch.test.tsx) |
| HM-4 | Meal lists | Filter to-make, saved, etc. (nav panel) | complete | home | NavRecipeSearch, filterRecipes |
| HM-6 | Low effort | Filter quick recipes (`effort: low`) | complete | home | filterRecipes, catalog |
| HM-7 | Star recipes | Mark favorites; persisted locally | complete | home | [RecipeCard.test.tsx](../src/components/RecipeCard/RecipeCard.test.tsx), [starredRecipes.test.ts](../src/features/starred-recipes/starredRecipes.test.ts) |
| HM-8 | Search category tabs | Custom filter presets as home tabs; All recipes last | complete | home | HomeCategoryTabs, searchCategories tests |
| HM-9 | Category + nav filters | Header search refines within active category | complete | home | mergeCategoryNavFilters, filterRecipes |
| HM-10 | Tag click on cards | Click tag on card → nav search filter | complete | home | RecipeCard, HomePage, TagFilterButton tests |
| HM-12 | Search empty state | No-results card; clear all resets nav + category tab | complete | home | CatalogEmptyState, HomePage tests |
| RD-1 | Recipe detail | Cook one recipe | complete | [recipe-detail](product-specs/pages/recipe-detail.md) | catalog + scaleIngredient |
| RD-5 | Print recipe | Print-friendly view | complete | recipe-detail | — |
| RD-6 | Video recipe | YouTube embed + seekable steps | complete | recipe-detail | RecipeDetailPage + TimedRecipeSteps tests |
| RD-7 | Sticky video player | Video stays visible while scrolling steps | complete | recipe-detail | — |
| RD-8 | Timestamp autoplay | Embed autoplays after step seek | complete | recipe-detail | RecipeDetailPage + YouTubeRecipePlayer tests |
| RD-9 | Star recipe | Toggle favorite from detail page | complete | recipe-detail | RecipeDetailPage + starredRecipes tests |
| RD-10 | Recipe editor | Local draft edits + AI notes on detail page | complete | recipe-detail | RecipeDetailPage + EditableRecipeField + recipeEdits tests |
| RD-11 | Delete recipe | Hide locally; export for Cursor catalog removal | complete | recipe-detail | RecipeDetailPage + recipeEdits tests |
| RD-12 | Magazine layout | Card layout, display typography, overlapping ingredients on hero | complete | recipe-detail | RecipeDetailPage.test.tsx |
| RD-13 | Hero scroll backdrop | Hero fades to blurred header backdrop on scroll | complete | recipe-detail | useHeroScrollEffect.test.ts |
| RD-14 | Video ingredient layout | Ingredients beside directions (same column ratios as image layout) | complete | recipe-detail | RecipeDetailPage.test.tsx |
| RD-15 | Recipe tags on detail | Click tag → home filter; add/remove tags on recipe | complete | recipe-detail | RecipeTags, TagFilterButton, RecipeDetailPage tests |
| RD-16 | Related recipes | Notes panel links via `pairedWith` (bidirectional) | complete | recipe-detail | RelatedRecipes.test.tsx, RecipeDetailPage.test.tsx |
| RD-17 | Ingredient linking | Bold food names in list; bold + hover amount card in directions | complete | recipe-detail | IngredientLine, IngredientMention, stepIngredientLinks tests |
| ST-1 | Settings | Export pending edits as JSON for Cursor | complete | [settings](product-specs/pages/settings.md) | [SettingsPage.test.tsx](../src/pages/SettingsPage/SettingsPage.test.tsx) |
| ST-7 | Search categories | Customize home filter tabs (tags, meal type, lists) | complete | settings | searchCategories, SearchCategoriesSettings tests |
| ST-8 | Theme | Light, dark, or classic family-site appearance | complete | settings | ThemeSettings, themeStorage tests |
| PL-1 | Starred cook queue | Reorderable list of starred recipes | complete | [planner](product-specs/pages/planner.md) | [StarredQueue.test.tsx](../src/features/starred-queue/StarredQueue.test.tsx), [StarredPage.test.tsx](../src/pages/StarredPage/StarredPage.test.tsx) |
| PL-3 | Queue drag reorder | Drag rows to change cook order | complete | planner | StarredQueue.test.tsx |
| PL-9 | Starred shopping list | Merged ingredients from queue with recipe usage | complete | planner | shoppingList.test.ts, StarredShoppingList.test.tsx |
| PL-10 | Copy shopping list | Copy merged list to clipboard | complete | planner | StarredShoppingList.test.tsx |
| PL-7 | Recipe meal types | Tag recipes by meal (catalog metadata) | complete | [recipes-schema](api-specs/data/recipes-schema.md) | [mealTypes.test.ts](../src/static-api/mealTypes.test.ts) |
| BT-1 | Bento planner page | Browse toddler bento ideas by section | complete | [bento-planner](product-specs/pages/bento-planner.md) | [BentoPlannerPage.test.tsx](../src/pages/BentoPlannerPage/BentoPlannerPage.test.tsx) |
| BT-2 | Bento item count | Choose 3–6 compartments for the box | complete | bento-planner | bentoPlannerStorage.test.ts |
| BT-3 | Build a bento | Add/remove ideas into a saved box list | complete | bento-planner | BentoPlannerPage.test.tsx |
| BT-4 | Bento recipe link | Jump to catalog recipe when an idea has one | complete | bento-planner | BentoPlannerPage.test.tsx |
| BT-6 | Randomize bento box | Spinner randomize whole box + randomize individual filled slots | complete | [bento-planner](product-specs/pages/bento-planner.md) | BentoPlannerPage.test.tsx, randomizeBentoPicks.test.ts |

## Static API

| ID | Name | User outcome | Status | API spec | Tests |
| -- | ---- | ------------ | ------ | -------- | ----- |
| CAT-API-1 | Recipe catalog | Load all recipes | complete | [recipes-catalog](api-specs/loaders/recipes-catalog.md) | [catalog.test.ts](../src/static-api/loaders/catalog.test.ts) |
| IDEAS-API-1 | Food ideas catalog | Load quick meal ideas | complete | [food-ideas-catalog](api-specs/loaders/food-ideas-catalog.md) | [foodIdeasCatalog.test.ts](../src/static-api/loaders/foodIdeasCatalog.test.ts) |
| BT-API-1 | Bento ideas catalog | Load bento filler ideas by section | complete | [bento-ideas-catalog](api-specs/loaders/bento-ideas-catalog.md) | [bentoIdeasCatalog.test.ts](../src/static-api/loaders/bentoIdeasCatalog.test.ts) |
| CAT-API-4 | Meal lists | Filter by list membership | complete | recipes-catalog | catalog |
| CAT-API-5 | Search | Query catalog | complete | — | [searchRecipes.test.ts](../src/static-api/loaders/searchRecipes.test.ts) |
| CAT-API-6 | All tags | Tag index | complete | — | [getAllTags.test.ts](../src/static-api/loaders/getAllTags.test.ts) |
| CAT-API-7 | YouTube recipes | `recipeKind` + `timedSteps` | complete | [recipes-schema](api-specs/data/recipes-schema.md) | catalog + parseYouTubeVideoId |
| CAT-API-7 | Effort filter | Recipes by `effort` field | complete | recipes-catalog | catalog |
| CAT-API-8 | Paired recipes | Recipes often served together (`pairedWith` slugs) | complete | [recipes-schema](api-specs/data/recipes-schema.md) | [catalog.test.ts](../src/static-api/loaders/catalog.test.ts) |

## Meal list counts

| List | Recipes |
| ---- | ------- |
| to-make | 28 |
| to-eat | 1 |
| healthy-ideas | 7 |
| saved | 80 |
| freezer-meals | 1 |

Regenerate data: `node scripts/build-recipes-catalog.mjs`

## Run

```bash
npm run dev
npm run test:run
npm run build
```
