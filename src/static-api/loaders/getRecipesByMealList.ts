import { loadRecipeCatalog } from './loadRecipeCatalog';
import type { MealList, Recipe } from '../types/recipe';

export async function getRecipesByMealList(list: MealList): Promise<Recipe[]> {
  const recipes = await loadRecipeCatalog();
  return recipes.filter((r) => r.mealLists?.includes(list) ?? false);
}
