export type Ingredient = {
  amount: string;
  unit: string;
  name: string;
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
