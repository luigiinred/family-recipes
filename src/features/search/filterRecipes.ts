import type { Effort, MealList, Recipe } from '@/static-api/types/recipe';

export type RecipeFilters = {
  query?: string;
  tag?: string;
  mealList?: MealList;
  effort?: Effort;
};

function recipeHaystack(recipe: Recipe): string {
  return [
    recipe.title,
    recipe.description,
    recipe.notes ?? '',
    ...recipe.tags,
    ...recipe.ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`),
    ...recipe.steps,
  ]
    .join(' ')
    .toLowerCase();
}

export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  let list = recipes;
  const q = filters.query?.trim().toLowerCase();
  if (q) {
    list = list.filter((r) => recipeHaystack(r).includes(q));
  }
  if (filters.tag) {
    list = list.filter((r) => r.tags.includes(filters.tag!));
  }
  if (filters.mealList) {
    list = list.filter((r) => r.mealLists?.includes(filters.mealList!));
  }
  if (filters.effort) {
    list = list.filter((r) => r.effort === filters.effort);
  }
  return list.sort((a, b) => a.title.localeCompare(b.title));
}
