import { recipeMatchesMealType } from '@/static-api/mealTypes';
import type { MealType } from '@/static-api/mealTypes';
import type { Effort, MealList, Recipe } from '@/static-api/types/recipe';

export type RecipeFilters = {
  query?: string;
  /** @deprecated Use `tags` for one or more tag filters. */
  tag?: string;
  tags?: string[];
  mealList?: MealList;
  effort?: Effort;
  mealType?: MealType;
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
  const tagFilters = filters.tags?.length
    ? filters.tags
    : filters.tag
      ? [filters.tag]
      : [];
  for (const tag of tagFilters) {
    list = list.filter((r) => r.tags.includes(tag));
  }
  if (filters.mealList) {
    list = list.filter((r) => r.mealLists?.includes(filters.mealList!));
  }
  if (filters.effort) {
    list = list.filter((r) => r.effort === filters.effort);
  }
  if (filters.mealType) {
    list = list.filter((r) => recipeMatchesMealType(r, filters.mealType!));
  }
  return list.sort((a, b) => a.title.localeCompare(b.title));
}
