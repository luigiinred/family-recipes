import { loadRecipeCatalog } from './loadRecipeCatalog';
import type { Recipe } from '../types/recipe';

export async function getRecipesByTag(tag: string): Promise<Recipe[]> {
  const normalized = tag.trim().toLowerCase();
  const recipes = await loadRecipeCatalog();
  return recipes.filter((r) =>
    r.tags.some((t) => t.toLowerCase() === normalized),
  );
}
