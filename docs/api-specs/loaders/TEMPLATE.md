# [Loader contract name]

**Module:** `src/static-api/loaders/<file>.ts`
**ID prefix:** `XX-API-` (match page prefix when 1:1)

---

## Summary

What callers (hooks, pages) use this loader for.

---

## Data source

| Artifact | Path |
| -------- | ---- |
| Canonical JSON | `src/static-api/data/recipes.json` |
| Public URL (if served) | `/data/recipes.json` |

---

## Types

```ts
// Link to src/static-api/types/recipe.ts
export type Recipe = { /* … */ };
```

---

## Operations

| ID | Function | Returns | Notes |
| -- | -------- | ------- | ----- |
| XX-API-1 | `getRecipes()` | `Promise<Recipe[]>` | Full catalog |
| XX-API-2 | `getRecipeBySlug(slug)` | `Promise<Recipe \| undefined>` | Missing slug → `undefined` |

---

## XX-API-1 — `getRecipes()`

### Behavior

- Loads catalog once, caches in memory
- Throws if fetch fails or JSON invalid

### Errors

| Condition | Behavior |
| --------- | -------- |
| HTTP not ok | `throw new Error('Failed to load recipes')` |
| Missing `recipes` array | *(document chosen behavior)* |

### Page dependencies

| Page | Spec |
| ---- | ---- |
| … | [../../product-specs/pages/….md](../../product-specs/pages/….md) |

---

## Features

| # | Feature | Description | Status | Tests |
| - | ------- | ----------- | ------ | ----- |
| XX-API-1 | Load catalog | Returns all recipes | planned | none |

---

## Decisions & spec drift

| Topic | Decision |
| ----- | -------- |
| Caching | In-memory singleton after first load |
