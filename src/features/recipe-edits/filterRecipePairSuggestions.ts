import type { Recipe } from '@/static-api/types/recipe';

export type RecipePairSuggestionOptions = {
  query: string;
  currentSlug: string;
  pairedSlugs: string[];
  limit?: number;
};

export function filterRecipePairSuggestions(
  allRecipes: Recipe[],
  options: RecipePairSuggestionOptions,
): Recipe[] {
  const q = options.query.trim().toLowerCase();
  const exclude = new Set([options.currentSlug, ...options.pairedSlugs]);

  let list = allRecipes.filter((recipe) => !exclude.has(recipe.slug));

  if (q) {
    list = list.filter((recipe) => {
      const haystack = [recipe.title, recipe.description, recipe.slug].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  list.sort((a, b) => a.title.localeCompare(b.title));
  return list.slice(0, options.limit ?? 12);
}
