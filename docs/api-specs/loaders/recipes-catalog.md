# Recipes catalog loaders

**Module:** `src/static-api/loaders/*`
**ID prefix:** `CAT-API-`

---

## Summary

Loads the personal recipe catalog from `src/static-api/data/recipes.json` (synced to `public/data/recipes.json`). Supports full list, lookup by slug, filter by tag, and filter by meal list (`to-make`, `to-eat`, `healthy-ideas`, `saved`, `freezer-meals`).

---

## Data source

| Artifact | Path |
| -------- | ---- |
| Canonical JSON | `src/static-api/data/recipes.json` |
| Public copy | `public/data/recipes.json` |
| Regenerate | `node scripts/build-recipes-catalog.mjs` |

---

## Operations

| ID | Function | Returns |
| -- | -------- | ------- |
| CAT-API-1 | `getRecipes()` | `Promise<Recipe[]>` |
| CAT-API-2 | `getRecipeBySlug(slug)` | `Promise<Recipe \| undefined>` |
| CAT-API-3 | `getRecipesByTag(tag)` | `Promise<Recipe[]>` |
| CAT-API-4 | `getRecipesByMealList(list)` | `Promise<Recipe[]>` |
| CAT-API-7 | `getRecipesByEffort(effort)` | `Promise<Recipe[]>` |
| CAT-API-8 | `getPairedRecipes(slug)` | `Promise<Recipe[]>` — resolves `pairedWith` slugs; skips unknown |

---

## Features

| # | Feature | Description | Status | Tests |
| - | ------- | ----------- | ------ | ----- |
| CAT-API-1 | Load catalog | 74 recipes from personal notes | complete | [`catalog.test.ts`](../../../src/static-api/loaders/catalog.test.ts) |
| CAT-API-5 | Enrich from sourceUrl | `npm run enrich:catalog` / **recipes-enrich-from-url** skill | complete | enrichments in `src/static-api/data/enrichments/` |
| CAT-API-6 | Import byonandlara.com | `npm run import:byonandlara` — 40 family recipes (`byl-*` slugs) | complete | `catalog.test.ts` byonandlara block |
| CAT-API-2 | Slug lookup | Includes `briam` with `sourceUrl` | complete | same |
| CAT-API-3 | Tag filter | e.g. `slow-cooker` | complete | same |
| CAT-API-4 | Meal list filter | `to-make` (7), `saved` (19) | complete | same |
| CAT-API-7 | Effort filter | `getRecipesByEffort('low')` — 7 `to-make` recipes flagged | complete | `catalog.test.ts` |
| CAT-API-8 | Paired recipes | `pairedWith` slugs → full `Recipe` rows (e.g. cheese bread ↔ KFA chili) | complete | `catalog.test.ts` |

---

## Catalog inventory (meal lists)

| Meal list | Count | Slugs (summary) |
| --------- | ----- | ---------------- |
| `to-make` | 7 | caesar-salad, mediterranean-salad, air-fried-*, zero-calorie-pasta-*, crema-salad, falafel |
| `to-eat` | 1 | freezer-soup |
| `healthy-ideas` | 7 | briam, gigantes, bean-chili, ratatouille, orzo-salad, pasta-primavera, potato-tacos |
| `saved` | 19 | Bookmarked web recipes with `sourceUrl` where noted |
| `freezer-meals` | 1 | freezer-soup (also `to-eat`) |
