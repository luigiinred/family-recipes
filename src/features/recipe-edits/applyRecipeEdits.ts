import type { Recipe } from '@/static-api/types/recipe';
import type { RecipeEdit } from './types';

export function isRecipeRemoved(edit?: RecipeEdit): boolean {
  return Boolean(edit?.removed);
}

export function applyRecipeEdit(recipe: Recipe, edit?: RecipeEdit): Recipe {
  if (!edit?.overrides) return recipe;
  return {
    ...recipe,
    ...edit.overrides,
    ingredients: edit.overrides.ingredients ?? recipe.ingredients,
    steps: edit.overrides.steps ?? recipe.steps,
    timedSteps: edit.overrides.timedSteps ?? recipe.timedSteps,
    pairedWith: edit.overrides.pairedWith ?? recipe.pairedWith,
  };
}

export function applyEditsToCatalog(recipes: Recipe[], edits: Record<string, RecipeEdit>): Recipe[] {
  return recipes
    .filter((recipe) => !isRecipeRemoved(edits[recipe.slug]))
    .map((recipe) => applyRecipeEdit(recipe, edits[recipe.slug]));
}
