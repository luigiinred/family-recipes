import type { IngredientUnit } from '../units';

export type Ingredient = {
  amount: string;
  /** Canonical measure from `MEASURE_UNITS`, sized `(N oz) can`, or `""` for count-only. See docs/api-specs/data/ingredient-units.md */
  unit: IngredientUnit | (string & {});
  name: string;
  /** Optional section label, e.g. "Garnishes" — consecutive matching groups render together */
  group?: string;
};

/** Seconds from the start of the linked YouTube video */
export type TimedStep = {
  text: string;
  startSeconds: number;
};

export type RecipeKind = 'standard' | 'youtube';

export type MealList =
  | 'to-make'
  | 'to-eat'
  | 'healthy-ideas'
  | 'saved'
  | 'freezer-meals';

export type Effort = 'low' | 'medium' | 'high';

import type { MealType } from '../mealTypes';

export type { MealType } from '../mealTypes';
export { MEAL_TYPES } from '../mealTypes';

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  tags: string[];
  /** Planner slots this recipe fits (breakfast, lunch, dinner, side, snack, dessert). */
  mealTypes?: MealType[];
  ingredients: Ingredient[];
  steps: string[];
  /** `youtube` enables embedded player + timestamped steps */
  recipeKind?: RecipeKind;
  /** Required when `recipeKind` is `youtube` */
  youtubeVideoId?: string;
  /** Jump targets for video recipes; keep `steps` in sync for search/print */
  timedSteps?: TimedStep[];
  sourceUrl?: string;
  mealLists?: MealList[];
  notes?: string;
  effort?: Effort;
  /** External site id, e.g. byonandlara recipe_id */
  externalId?: string;
  /** Slugs of other catalog recipes often served with this one */
  pairedWith?: string[];
};

export type RecipeCatalog = {
  recipes: Recipe[];
};

export const MEAL_LISTS: readonly MealList[] = [
  'to-make',
  'to-eat',
  'healthy-ideas',
  'saved',
  'freezer-meals',
] as const;
