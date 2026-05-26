# Food ideas catalog loader

## Summary

Loads quick meal **ideas** (not full recipes) for home search and the weekly planner. Separate JSON from the recipe catalog.

## Source

| Path | Notes |
| ---- | ----- |
| `src/static-api/data/food-ideas.json` | Authoritative |
| `public/data/food-ideas.json` | Copied at build via `sync:recipes-data` |

## Types

- `FoodIdea` — `src/static-api/types/foodIdea.ts`
- `FoodIdeaCatalog` — `{ ideas: FoodIdea[] }`
- Schema — [food-ideas-schema.md](../data/food-ideas-schema.md)

## Operations

| Function | Returns | Notes |
| -------- | ------- | ----- |
| `loadFoodIdeasCatalog()` | `Promise<FoodIdea[]>` | In-memory cache; throws if `ideas` missing |
| `getFoodIdeas()` | `Promise<FoodIdea[]>` | Alias of catalog load |
| `getFoodIdeaBySlug(slug)` | `Promise<FoodIdea \| undefined>` | Lookup by slug |
| `resetFoodIdeasCatalogCache()` | `void` | Test helper |

## Plan references

`encodePlanRef` / `decodePlanRef` in `src/static-api/planRef.ts` — ideas use `idea:<slug>` in planner `localStorage`.

## Page dependencies

| Page | Usage |
| ---- | ----- |
| [home.md](../../product-specs/pages/home.md) | Search grid includes ideas |
| [planner.md](../../product-specs/pages/planner.md) | Drag ideas onto calendar; auto-fill pool |

## Features

| ID | Feature | Status | Tests |
| -- | ------- | ------ | ----- |
| IDEAS-API-1 | Load ideas catalog | complete | `foodIdeasCatalog.test.ts` |
| IDEAS-API-2 | Lookup by slug | complete | `foodIdeasCatalog.test.ts` |
| IDEAS-API-3 | Plan ref encode/decode | complete | `planRef.test.ts` |
