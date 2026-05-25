import { loadRecipeCatalog } from './loadRecipeCatalog';
import type { Recipe } from '../types/recipe';

export async function getRecipeBySlug(slug: string): Promise<Recipe | undefined> {
  const recipes = await loadRecipeCatalog();
  return recipes.find((r) => r.slug === slug);
}
