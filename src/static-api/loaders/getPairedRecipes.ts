import { getRecipeBySlug } from './getRecipeBySlug';
import { loadRecipeCatalog } from './loadRecipeCatalog';
import type { Recipe } from '../types/recipe';

/** Recipes linked via `pairedWith` slugs; unknown slugs are skipped. */
export async function getPairedRecipes(slug: string): Promise<Recipe[]> {
  const recipe = await getRecipeBySlug(slug);
  if (!recipe?.pairedWith?.length) return [];

  const catalog = await loadRecipeCatalog();
  const bySlug = new Map(catalog.map((r) => [r.slug, r]));

  return recipe.pairedWith
    .map((pairedSlug) => bySlug.get(pairedSlug))
    .filter((r): r is Recipe => r !== undefined);
}
