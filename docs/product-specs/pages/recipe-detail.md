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
| `getPairedRecipes` | [recipes-catalog](../../api-specs/loaders/recipes-catalog.md) | `pairedWith` slugs → related recipe rows |

---

## Features

| ID | Feature | Status | Tests |
| -- | ------- | ------ | ----- |
| RD-1 | Recipe header + image | complete | `recipeImageUrl.test.ts` |
| RD-2 | Servings scale on ingredients | Click servings in recipe header to adjust; scales ingredient amounts | complete | `scaleIngredient.test.ts`, RecipeDetailPage.test.tsx |
| RD-3 | Steps list | complete | — |
| RD-17 | Ingredient display | Amount · unit · **bold name** in list; direction text **bolds** catalog ingredients with hover card showing scaled amount | complete | `IngredientLine`, `IngredientMention`, `stepIngredientLinks.test.ts` |
| RD-4 | Source URL link | complete | `catalog.test.ts` |
| RD-5 | Print layout | complete | — |
| RD-6 | YouTube embed + timestamped steps | complete | [RecipeDetailPage.test.tsx](../../../src/pages/RecipeDetailPage/RecipeDetailPage.test.tsx), [TimedRecipeSteps.test.tsx](../../../src/components/TimedRecipeSteps/TimedRecipeSteps.test.tsx) |
| RD-7 | Sticky video player while scrolling steps | Sticky left column; video stays visible while directions scroll (YouTube-style) | complete | RecipeDetailPage.test.tsx |
| RD-8 | Autoplay embed after timestamp seek | complete | [RecipeDetailPage.test.tsx](../../../src/pages/RecipeDetailPage/RecipeDetailPage.test.tsx), [YouTubeRecipePlayer.test.tsx](../../../src/components/YouTubeRecipePlayer/YouTubeRecipePlayer.test.tsx) |
| RD-9 | Star recipe | Toggle starred state from detail header; synced with card stars via localStorage | complete | [RecipeDetailPage.test.tsx](../../../src/pages/RecipeDetailPage/RecipeDetailPage.test.tsx), [starredRecipes.test.ts](../../../src/features/starred-recipes/starredRecipes.test.ts) |
| RD-10 | Recipe editor | Editor mode (Settings): hover fields on detail to edit inline; per-field AI notes | complete | [RecipeDetailPage.test.tsx](../../../src/pages/RecipeDetailPage/RecipeDetailPage.test.tsx), [EditableRecipeField.test.tsx](../../../src/features/recipe-edits/EditableRecipeField.test.tsx), [recipeEdits.test.ts](../../../src/features/recipe-edits/recipeEdits.test.ts) |
| RD-11 | Delete recipe | Hover trash on hero/video image (editor mode); hide locally; export `deletedRecipes` for Cursor | complete | RecipeDetailPage.test.tsx, RecipeCard.test.tsx, recipeEdits.test.ts |
| RD-12 | Magazine layout | Card layout with display typography; ingredients overlap hero image; directions + notes columns | complete | [RecipeDetailPage.test.tsx](../../../src/pages/RecipeDetailPage/RecipeDetailPage.test.tsx) |
| RD-13 | Hero scroll backdrop | Inline hero fades into blurred fixed header backdrop while scrolling (`prefers-reduced-motion` off) | complete | [useHeroScrollEffect.test.ts](../../../src/pages/RecipeDetailPage/useHeroScrollEffect.test.ts) |
| RD-14 | Video ingredient layout | YouTube: sticky video column + scrollable ingredients / directions / notes; mobile stacks video then content | complete | RecipeDetailPage.test.tsx |
| RD-15 | Recipe tags | Tag chips on detail; click tag → home with nav search filter; + to add with catalog autocomplete or create new tag; edits persist locally | complete | [RecipeTags.test.tsx](../../../src/components/RecipeTags/RecipeTags.test.tsx), [TagFilterButton.test.tsx](../../../src/components/TagFilterButton/TagFilterButton.test.tsx), RecipeDetailPage.test.tsx, [patchRecipeTags.test.ts](../../../src/features/recipe-edits/patchRecipeTags.test.ts) |
| RD-16 | Related recipes | Notes panel links to catalog recipes in `pairedWith` (bidirectional pairs, e.g. cheese bread ↔ KFA chili); editor mode search to add/remove links (saved in local edits) | complete | [RelatedRecipes.test.tsx](../../../src/components/RelatedRecipes/RelatedRecipes.test.tsx), RecipeDetailPage.test.tsx, [patchRecipePairedWith.test.ts](../../../src/features/recipe-edits/patchRecipePairedWith.test.ts) |
