import type { Recipe } from '../types/recipe';
import { loadRecipeCatalog } from './loadRecipeCatalog';

function recipeHaystack(recipe: Recipe): string {
  const parts = [
    recipe.title,
    recipe.description,
    recipe.notes ?? '',
    ...recipe.tags,
    ...recipe.ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`),
    ...recipe.steps,
  ];
  return parts.join(' ').toLowerCase();
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const recipes = await loadRecipeCatalog();
  const q = query.trim().toLowerCase();
  if (!q) return recipes;
  return recipes.filter((r) => recipeHaystack(r).includes(q));
}
