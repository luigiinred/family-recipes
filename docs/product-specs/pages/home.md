# Home — recipe catalog

Browse the recipe catalog. **Food ideas** (takeout, pantry snacks, kid bites — not full recipes) are hidden by default; turn on **Quick ideas** in the nav search filter panel to mix them into the grid with the same card layout as recipes. **Category tabs** apply saved filter presets (tags, meal type, meal list, low effort); the last tab is always **All recipes**. Search, tags, meal lists, and effort filters in the header refine results on top of the active category. Meal-list filters hide ideas; low-effort filter keeps ideas when Quick ideas is on. Customize categories in [Settings](settings.md).

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
| `NavRecipeSearch` (in `AppLayout`) | Full-text query + expandable tag/list/effort/catalog filters |
| `RecipeFilterProvider` | Shared filter state for home grid |
| `HomeCategoryTabs` | Category tab bar (custom presets + All recipes) |
| `RecipeCard` | Full recipe grid tiles |
| `FoodIdeaCard` | Quick idea tiles (recipe-style card, no detail page) |
| `CatalogEmptyState` | No-results panel with optional **Clear all filters** |

---

## API dependencies

| Operation | Spec | Role |
| --------- | ---- | ---- |
| `getRecipes` | [recipes-catalog](../../api-specs/loaders/recipes-catalog.md) | Recipe catalog load |
| `getFoodIdeas` | [food-ideas-catalog](../../api-specs/loaders/food-ideas-catalog.md) | Quick ideas load |
| `getAllTags` | — | Tag suggestions (recipes + ideas) |

---

## Features

| ID | Feature | Status | Tests |
| -- | ------- | ------ | ----- |
| HM-1 | Recipe grid | complete | `HomePage.test.tsx` |
| HM-2 | Full-text search (nav bar) | complete | `NavRecipeSearch.test.tsx`, `filterRecipes.test.ts` |
| HM-3 | Tag filters (quick + more in nav panel) | complete | `NavRecipeSearch.test.tsx` |
| HM-10 | Tag click on cards | Click a tag on a recipe card to add it to nav search filters | complete | `RecipeCard.test.tsx`, `HomePage.test.tsx` |
| HM-4 | Meal list filters (nav panel) | complete | `NavRecipeSearch.test.tsx`, `filterRecipes.test.ts` |
| HM-5 | Quick tag chips (incl. vegetarian) | complete | `NavRecipeSearch.test.tsx`, `tags.test.ts` |
| HM-6 | Low effort filter | Show only `effort: low` recipes | complete | `filterRecipes.test.ts`, `HomePage.test.tsx` |
| HM-7 | Star recipes | Toggle starred state on card hover; persisted in localStorage | complete | `RecipeCard.test.tsx`, `starredRecipes.test.ts` |
| HM-8 | Search category tabs | Standard horizontal tabs; colored underline per category; last tab is All recipes | complete | `HomeCategoryTabs.test.tsx`, `HomePage.test.tsx` |
| HM-9 | Category + nav filters | Nav search refines within active category preset | complete | `mergeCategoryNavFilters.test.ts`, `filterRecipes.test.ts` |
| HM-11 | Food ideas in grid | Optional via nav **Quick ideas** filter; same card format as recipes | complete | `FoodIdeaCard.test.tsx`, `NavRecipeSearch.test.tsx`, `filterCatalog.test.ts`, `HomePage.test.tsx` |
| HM-12 | Search empty state | Centered no-results card; **Clear all filters** resets nav search and category tab | complete | `CatalogEmptyState.test.tsx`, `HomePage.test.tsx` |
