import type { FoodIdea } from '@/static-api/types/foodIdea';
import type { Recipe } from '@/static-api/types/recipe';
import { filterFoodIdeas } from './filterFoodIdeas';
import { filterRecipes, type RecipeFilters } from './filterRecipes';

export type CatalogFilters = RecipeFilters & {
  includeIdeas?: boolean;
};

export type CatalogEntry =
  | { kind: 'recipe'; item: Recipe }
  | { kind: 'idea'; item: FoodIdea };

function entryTitle(entry: CatalogEntry): string {
  return entry.item.title;
}

/**
 * Filters recipes and food ideas with shared nav/category filters.
 * Meal-list filters apply to recipes only; ideas are omitted when a list is active.
 * Low-effort filter keeps all ideas (they are quick options by definition).
 */
export function filterCatalog(
  recipes: Recipe[],
  ideas: FoodIdea[],
  filters: CatalogFilters,
): CatalogEntry[] {
  const recipeEntries: CatalogEntry[] = filterRecipes(recipes, filters).map((item) => ({
    kind: 'recipe',
    item,
  }));

  if (!filters.includeIdeas) {
    return recipeEntries;
  }

  if (filters.mealList) {
    return recipeEntries;
  }

  if (filters.effort && filters.effort !== 'low') {
    return recipeEntries;
  }

  const ideaEntries: CatalogEntry[] = filterFoodIdeas(ideas, {
    query: filters.query,
    tags: filters.tags?.length ? filters.tags : filters.tag ? [filters.tag] : undefined,
    mealType: filters.mealType,
  }).map((item) => ({ kind: 'idea', item }));

  return [...recipeEntries, ...ideaEntries].sort((a, b) =>
    entryTitle(a).localeCompare(entryTitle(b)),
  );
}
