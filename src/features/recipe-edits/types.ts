import type { Ingredient, Recipe, TimedStep } from '@/static-api/types/recipe';

export const STORAGE_KEY = 'recipes-recipe-edits-v1';

export type RecipeFieldOverrides = Partial<
  Pick<
    Recipe,
    | 'title'
    | 'description'
    | 'notes'
    | 'ingredients'
    | 'steps'
    | 'timedSteps'
    | 'tags'
    | 'pairedWith'
  >
>;

export type RecipeAiNotes = Partial<{
  global: string;
  remove: string;
  title: string;
  description: string;
  notes: string;
  ingredients: string;
  steps: string;
}>;

export type RecipeEdit = {
  slug: string;
  removed?: boolean;
  overrides?: RecipeFieldOverrides;
  aiNotes?: RecipeAiNotes;
  updatedAt: string;
};

export type RecipeEditsStore = {
  version: 1;
  edits: Record<string, RecipeEdit>;
};

export type DeletedRecipeExport = {
  slug: string;
  catalogTitle?: string;
  aiNote?: string;
};

export type CursorRecipeEditsExport = {
  exportedAt: string;
  purpose: string;
  targetFile: string;
  /** Recipes hidden in the app; remove these rows from the catalog JSON */
  deletedRecipes: DeletedRecipeExport[];
  edits: RecipeEdit[];
};

export function emptyIngredient(): Ingredient {
  return { amount: '', unit: '', name: '' };
}

export function ingredientsToLines(ingredients: Ingredient[]): string {
  return ingredients
    .map((ing) => [ing.amount, ing.unit, ing.name].filter(Boolean).join(' '))
    .join('\n');
}

export function linesToIngredients(text: string): Ingredient[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      if (parts.length === 0) return emptyIngredient();
      if (parts.length === 1) return { amount: '', unit: '', name: parts[0] };
      const amount = parts[0];
      const maybeUnit = parts[1];
      const rest = parts.slice(2).join(' ');
      if (rest) {
        return { amount, unit: maybeUnit, name: rest };
      }
      return { amount: '', unit: '', name: line };
    });
}

export function stepsToText(steps: string[]): string {
  return steps.join('\n');
}

export function textToSteps(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function timedStepsToText(steps: TimedStep[]): string {
  return steps.map((s) => `${s.startSeconds}\t${s.text}`).join('\n');
}

export function textToTimedSteps(text: string): TimedStep[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const tab = line.indexOf('\t');
      if (tab >= 0) {
        const startSeconds = Number.parseInt(line.slice(0, tab), 10);
        const stepText = line.slice(tab + 1).trim();
        return {
          startSeconds: Number.isFinite(startSeconds) ? startSeconds : 0,
          text: stepText,
        };
      }
      return { startSeconds: 0, text: line };
    });
}
