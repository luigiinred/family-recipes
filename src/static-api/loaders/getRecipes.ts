import { loadRecipeCatalog } from './loadRecipeCatalog';
import type { Recipe } from '../types/recipe';

export async function getRecipes(): Promise<Recipe[]> {
  return loadRecipeCatalog();
}
