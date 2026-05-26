import type { MealType } from '@/static-api/mealTypes';
import type { SearchCategory } from '@/features/search/searchCategories';

const CATEGORY_COLOR_VARS: Record<string, string> = {
  dinner: '--color-category-dinner',
  lunch: '--color-category-lunch',
  dessert: '--color-category-dessert',
  snacks: '--color-category-snack',
  snack: '--color-category-snack',
  all: '--color-category-all',
};

const MEAL_TYPE_COLOR_VARS: Record<MealType, string> = {
  breakfast: '--color-category-lunch',
  lunch: '--color-category-lunch',
  dinner: '--color-category-dinner',
  side: '--color-category-snack',
  snack: '--color-category-snack',
  dessert: '--color-category-dessert',
};

export function getCategoryTabColorVar(category: Pick<SearchCategory, 'id' | 'filters'>): string {
  return (
    CATEGORY_COLOR_VARS[category.id] ??
    (category.filters.mealType ? MEAL_TYPE_COLOR_VARS[category.filters.mealType] : undefined) ??
    '--color-category-default'
  );
}

export const ALL_RECIPES_TAB_COLOR_VAR = '--color-category-all';
