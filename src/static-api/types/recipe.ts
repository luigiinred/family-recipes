export type Ingredient = {
  amount: string;
  unit: string;
  name: string;
};

export type MealList =
  | 'to-make'
  | 'to-eat'
  | 'healthy-ideas'
  | 'saved'
  | 'freezer-meals';

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
  sourceUrl?: string;
  mealLists?: MealList[];
  notes?: string;
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
