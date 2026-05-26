import type { Recipe } from '@/static-api/types/recipe';
import { normalizeTag } from '@/lib/normalizeTag';
import { upsertRecipeEdit } from './recipeEdits';
import type { RecipeEdit, RecipeFieldOverrides } from './types';

function sortedTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => a.localeCompare(b));
}

function tagsEqual(a: string[], b: string[]): boolean {
  return JSON.stringify(sortedTags(a)) === JSON.stringify(sortedTags(b));
}

export function patchRecipeTags(
  slug: string,
  catalogRecipe: Recipe,
  existingEdit: RecipeEdit | undefined,
  nextTags: string[],
): RecipeEdit {
  const tags = [...new Set(nextTags.map(normalizeTag).filter(Boolean))];
  const overrides: RecipeFieldOverrides = { ...existingEdit?.overrides };

  if (tagsEqual(tags, catalogRecipe.tags)) {
    delete overrides.tags;
  } else {
    overrides.tags = tags;
  }

  return upsertRecipeEdit(slug, {
    overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    aiNotes: existingEdit?.aiNotes,
    removed: existingEdit?.removed,
  });
}
