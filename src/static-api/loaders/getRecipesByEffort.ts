import { loadRecipeCatalog } from './loadRecipeCatalog';
import type { Effort, Recipe } from '../types/recipe';

export async function getRecipesByEffort(effort: Effort): Promise<Recipe[]> {
  const recipes = await loadRecipeCatalog();
  return recipes.filter((r) => r.effort === effort);
}
