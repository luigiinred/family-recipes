import type { Recipe } from '@/static-api/types/recipe';
import type { RecipeAiNotes, RecipeEdit, RecipeFieldOverrides } from './types';
import {
  ingredientsToLines,
  linesToIngredients,
  stepsToText,
  textToSteps,
  textToTimedSteps,
  timedStepsToText,
} from './types';
import { upsertRecipeEdit } from './recipeEdits';

export type EditableRecipeFieldName =
  | 'title'
  | 'description'
  | 'notes'
  | 'ingredients'
  | 'steps'
  | 'remove';

function cleanAiNotes(aiNotes: RecipeAiNotes): RecipeAiNotes | undefined {
  const cleaned = Object.fromEntries(
    Object.entries(aiNotes).filter(([, value]) => typeof value === 'string' && value.trim()),
  ) as RecipeAiNotes;
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

function setOverrideKey(
  overrides: RecipeFieldOverrides,
  key: keyof RecipeFieldOverrides,
  value: unknown,
) {
  if (value === undefined) {
    delete overrides[key];
  } else {
    Object.assign(overrides, { [key]: value });
  }
}

export function buildFieldOverrides(
  catalogRecipe: Recipe,
  field: EditableRecipeFieldName,
  value: string,
): RecipeFieldOverrides | undefined {
  const overrides: RecipeFieldOverrides = {};

  switch (field) {
    case 'title': {
      const title = value.trim();
      if (title && title !== catalogRecipe.title) overrides.title = title;
      break;
    }
    case 'description': {
      const description = value.trim();
      if (description && description !== catalogRecipe.description) {
        overrides.description = description;
      }
      break;
    }
    case 'notes': {
      const notes = value.trim();
      const catalogNotes = catalogRecipe.notes ?? '';
      if (notes !== catalogNotes) overrides.notes = notes;
      break;
    }
    case 'ingredients': {
      const ingredients = linesToIngredients(value);
      if (JSON.stringify(ingredients) !== JSON.stringify(catalogRecipe.ingredients)) {
        overrides.ingredients = ingredients;
      }
      break;
    }
    case 'steps': {
      if (catalogRecipe.timedSteps && catalogRecipe.timedSteps.length > 0) {
        const timedSteps = textToTimedSteps(value);
        if (JSON.stringify(timedSteps) !== JSON.stringify(catalogRecipe.timedSteps ?? [])) {
          overrides.timedSteps = timedSteps;
          overrides.steps = timedSteps.map((s) => s.text);
        }
      } else {
        const steps = textToSteps(value);
        if (JSON.stringify(steps) !== JSON.stringify(catalogRecipe.steps)) {
          overrides.steps = steps;
        }
      }
      break;
    }
    default:
      break;
  }

  return Object.keys(overrides).length > 0 ? overrides : undefined;
}

export function getFieldDisplayValue(
  recipe: Recipe,
  field: Exclude<EditableRecipeFieldName, 'remove'>,
): string {
  switch (field) {
    case 'title':
      return recipe.title;
    case 'description':
      return recipe.description;
    case 'notes':
      return recipe.notes ?? '';
    case 'ingredients':
      return ingredientsToLines(recipe.ingredients);
    case 'steps':
      return recipe.timedSteps && recipe.timedSteps.length > 0
        ? timedStepsToText(recipe.timedSteps)
        : stepsToText(recipe.steps);
    default:
      return '';
  }
}

export function patchRecipeField(
  slug: string,
  catalogRecipe: Recipe,
  existingEdit: RecipeEdit | undefined,
  field: EditableRecipeFieldName,
  value: string,
  aiNote = '',
): RecipeEdit {
  if (field === 'remove') {
    const aiNotes: RecipeAiNotes = { ...existingEdit?.aiNotes };
    if (aiNote.trim()) {
      aiNotes.remove = aiNote.trim();
    } else {
      delete aiNotes.remove;
    }
    return upsertRecipeEdit(slug, {
      removed: value === 'true',
      aiNotes: cleanAiNotes(aiNotes),
    });
  }

  const overrides: RecipeFieldOverrides = { ...existingEdit?.overrides };
  const fieldOverrides = buildFieldOverrides(catalogRecipe, field, value);
  const fieldKey = field as keyof RecipeFieldOverrides;

  if (fieldOverrides?.[fieldKey] !== undefined) {
    setOverrideKey(overrides, fieldKey, fieldOverrides[fieldKey]);
  } else {
    setOverrideKey(overrides, fieldKey, undefined);
    if (field === 'steps' && catalogRecipe.timedSteps?.length) {
      setOverrideKey(overrides, 'timedSteps', undefined);
      setOverrideKey(overrides, 'steps', undefined);
    }
  }

  const aiNotes: RecipeAiNotes = { ...existingEdit?.aiNotes };
  const aiKey = field as keyof RecipeAiNotes;
  if (aiNote.trim()) {
    aiNotes[aiKey] = aiNote.trim();
  } else {
    delete aiNotes[aiKey];
  }

  return upsertRecipeEdit(slug, {
    overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    aiNotes: cleanAiNotes(aiNotes),
  });
}
