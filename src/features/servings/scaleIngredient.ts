import type { Ingredient } from '@/static-api/types/recipe';

export function scaleIngredient(ingredient: Ingredient, factor: number): Ingredient {
  const parsed = Number.parseFloat(ingredient.amount);
  if (Number.isNaN(parsed)) {
    return ingredient;
  }
  const scaled = parsed * factor;
  const amount =
    Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(2).replace(/\.?0+$/, '');
  return { ...ingredient, amount };
}
