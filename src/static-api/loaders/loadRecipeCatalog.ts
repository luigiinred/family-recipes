import catalogData from '../data/recipes.json';
import type { Recipe, RecipeCatalog } from '../types/recipe';

let cache: Recipe[] | null = null;

/** Clears in-memory cache (for tests). */
export function resetRecipeCatalogCache(): void {
  cache = null;
}

export async function loadRecipeCatalog(): Promise<Recipe[]> {
  if (cache) return cache;
  const data = catalogData as RecipeCatalog;
  if (!Array.isArray(data.recipes)) {
    throw new Error('Invalid recipe catalog: missing recipes array');
  }
  cache = data.recipes;
  return cache;
}
