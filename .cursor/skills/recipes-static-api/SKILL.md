---
name: recipes-static-api
description: >-
  Static JSON API for recipe data — schemas, loaders, types, and tests without a
  backend. Use when adding recipes, fetching by slug/tag, or wiring data into
  React hooks.
---

# Recipes static API

All recipe data is **versioned JSON** loaded at build/runtime via `fetch` or static import. No server, no client secrets.

**Document loader behavior first** in `docs/api-specs/loaders/` (**api-specs** skill) with `planned` → `complete` and test links.

## Layout

```
src/static-api/
  types/
    recipe.ts
  data/
    recipes.json
  loaders/
    getRecipes.ts
    getRecipeBySlug.ts
    getRecipesByTag.ts
  loaders/*.test.ts
```

## JSON shape

```json
{
  "recipes": [
    {
      "id": "1",
      "slug": "tomato-soup",
      "title": "Tomato Soup",
      "description": "…",
      "imageUrl": "/images/tomato-soup.jpg",
      "prepMinutes": 10,
      "cookMinutes": 25,
      "servings": 4,
      "tags": ["soup", "vegetarian"],
      "ingredients": [
        { "amount": "2", "unit": "cups", "name": "tomatoes" }
      ],
      "steps": ["Chop tomatoes.", "Simmer 20 minutes."]
    }
  ]
}
```

## TypeScript types

```ts
export type Ingredient = { amount: string; unit: string; name: string };

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
};
```

## Loader pattern

- Single module owns fetch/parse: `loadRecipeCatalog(): Promise<Recipe[]>`
- Public functions filter in memory: `getRecipeBySlug(slug)`, `getRecipesByTag(tag)`
- Validate required fields in tests; throw or return `undefined` for missing slug — pick one and test it

```ts
const CATALOG_URL = '/data/recipes.json';

let cache: Recipe[] | null = null;

async function loadCatalog(): Promise<Recipe[]> {
  if (cache) return cache;
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error('Failed to load recipes');
  const json = await res.json();
  cache = json.recipes;
  return cache;
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | undefined> {
  const recipes = await loadCatalog();
  return recipes.find((r) => r.slug === slug);
}
```

For Vitest, mock `global.fetch` or import JSON in tests:

```ts
import catalog from '../data/recipes.json';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => catalog,
  }));
});
```

## Serving JSON

- Dev/prod: place public copy at `public/data/recipes.json` **or** import in loader for bundling
- Keep `src/static-api/data/recipes.json` as source; sync via script or duplicate only if documented

## React integration

```ts
// hooks/useRecipe.ts — test hook with renderHook
export function useRecipe(slug: string | undefined) {
  const [recipe, setRecipe] = useState<Recipe | undefined>();
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    if (!slug) return;
    getRecipeBySlug(slug).then(setRecipe).catch(setError);
  }, [slug]);
  return { recipe, error, loading: !recipe && !error };
}
```

Hooks are thin; **loader tests** carry parsing/filter correctness.

## Adding a recipe

1. Extend JSON with valid slug (kebab-case, unique)
2. Add loader test if new field or filter
3. No component changes unless UI exposes the new field

## Anti-patterns

- `fetch` scattered in page components
- Untyped `any` from JSON
- Mixing CMS shapes with UI types — map once in loader
