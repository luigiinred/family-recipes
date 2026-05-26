/** When a recipe is appropriate for the weekly planner (and filtering). */
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'side',
  'snack',
  'dessert',
] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  side: 'Side',
  snack: 'Snack',
  dessert: 'Dessert',
};

type MealTypeInput = {
  title: string;
  tags: string[];
  description?: string;
};

const DESSERT =
  /\b(dessert|cake|cookie|brownie|pudding|pie|tart|muffin|cupcake|ice cream|sorbet|fudge|trifle|cheesecake|crumble|cobbler)\b/i;
const BREAKFAST =
  /\b(breakfast|brunch|pancake|waffle|oatmeal|granola|french toast|omelette|omelet|scramble|frittata|overnight oats|egg bake|shakshuka)\b/i;
const SNACK =
  /\b(snack|appetizer|appetiser|bite|bites|dip|chips|popcorn|trail mix|energy ball)\b/i;
const SIDE =
  /\b(side|salad|slaw|coleslaw|bread|roll|biscuit|cornbread|rice\b|orzo salad|tabbouleh|hummus|dip)\b/i;
const LUNCH =
  /\b(lunch|sandwich|wrap|quesadilla|taco|burrito|bowl|soup|chili|stew|salad)\b/i;

function unique(types: MealType[]): MealType[] {
  return [...new Set(types)];
}

/** Heuristic meal-type tags when `mealTypes` is omitted on a recipe. */
export function inferMealTypes(recipe: MealTypeInput): MealType[] {
  const haystack = `${recipe.title} ${recipe.tags.join(' ')} ${recipe.description ?? ''}`;

  if (DESSERT.test(haystack)) {
    return ['dessert'];
  }
  if (BREAKFAST.test(haystack)) {
    return ['breakfast'];
  }
  if (SNACK.test(haystack)) {
    return ['snack'];
  }

  const types: MealType[] = [];

  if (SIDE.test(haystack) && !/\b(main|entree|entrée|dinner)\b/i.test(haystack)) {
    types.push('side');
  }
  if (LUNCH.test(haystack)) {
    types.push('lunch');
  }

  if (types.length === 0) {
    return ['lunch', 'dinner'];
  }

  if (!types.includes('dinner') && !types.includes('lunch')) {
    types.push('lunch', 'dinner');
  } else if (!types.includes('dinner')) {
    types.push('dinner');
  }

  return unique(types);
}

export function resolveMealTypes(
  recipe: MealTypeInput & { mealTypes?: MealType[] },
): MealType[] {
  if (recipe.mealTypes?.length) {
    return unique(recipe.mealTypes);
  }
  return inferMealTypes(recipe);
}

export function recipeMatchesMealType(
  recipe: MealTypeInput & { mealTypes?: MealType[] },
  mealType: MealType,
): boolean {
  return resolveMealTypes(recipe).includes(mealType);
}
