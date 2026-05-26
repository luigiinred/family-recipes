import type { Recipe } from '@/static-api/types/recipe';

/** Resolve `pairedWith` slugs to catalog rows; unknown slugs are skipped. */
export function resolvePairedRecipes(recipe: Recipe, catalog: Recipe[]): Recipe[] {
  const slugs = recipe.pairedWith;
  if (!slugs?.length) return [];

  const bySlug = new Map(catalog.map((r) => [r.slug, r]));
  return slugs
    .map((pairedSlug) => bySlug.get(pairedSlug))
    .filter((r): r is Recipe => r !== undefined);
}
