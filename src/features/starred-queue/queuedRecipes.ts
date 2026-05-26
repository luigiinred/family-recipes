import type { Recipe } from '@/static-api/types/recipe';

export function selectQueuedRecipes(recipes: Recipe[], starredSlugs: string[]): Recipe[] {
  const bySlug = new Map(recipes.map((recipe) => [recipe.slug, recipe]));
  return starredSlugs
    .map((slug) => bySlug.get(slug))
    .filter((recipe): recipe is Recipe => recipe !== undefined);
}
