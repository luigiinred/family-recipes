import type { RecipeFilterState } from './RecipeFilterContext';
import type { RecipeFilters } from './filterRecipes';
import type { SearchCategoryFilters } from './searchCategories';

export function mergeCategoryNavFilters(
  category: SearchCategoryFilters | undefined,
  nav: Pick<RecipeFilterState, 'query' | 'tags' | 'mealList' | 'lowEffortOnly'>,
): RecipeFilters {
  const mergedTags = [...new Set([...(category?.tags ?? []), ...nav.tags])].sort();
  const query = nav.query.trim();
  return {
    query: query.length > 0 ? query : undefined,
    tags: mergedTags.length > 0 ? mergedTags : undefined,
    mealList: nav.mealList ?? category?.mealList,
    effort: nav.lowEffortOnly ? 'low' : category?.effort,
    mealType: category?.mealType,
  };
}
