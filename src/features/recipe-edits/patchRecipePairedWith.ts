import type { Recipe } from '@/static-api/types/recipe';
import { upsertRecipeEdit } from './recipeEdits';
import type { RecipeEdit, RecipeFieldOverrides } from './types';

function sortedSlugs(slugs: string[]): string[] {
  return [...new Set(slugs)].sort((a, b) => a.localeCompare(b));
}

function pairedEqual(a: string[] | undefined, b: string[] | undefined): boolean {
  return JSON.stringify(sortedSlugs(a ?? [])) === JSON.stringify(sortedSlugs(b ?? []));
}

export function patchRecipePairedWith(
  slug: string,
  catalogRecipe: Recipe,
  existingEdit: RecipeEdit | undefined,
  nextSlugs: string[],
): RecipeEdit {
  const pairedWith = sortedSlugs(nextSlugs);
  const overrides: RecipeFieldOverrides = { ...existingEdit?.overrides };

  if (pairedEqual(pairedWith, catalogRecipe.pairedWith)) {
    delete overrides.pairedWith;
  } else {
    overrides.pairedWith = pairedWith;
  }

  return upsertRecipeEdit(slug, {
    overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    aiNotes: existingEdit?.aiNotes,
    removed: existingEdit?.removed,
  });
}
