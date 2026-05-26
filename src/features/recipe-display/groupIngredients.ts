import type { Ingredient } from '@/static-api/types/recipe';

export type IngredientGroup = {
  label: string;
  items: Ingredient[];
};

/** Consecutive ingredients with the same optional `group` render together. */
export function groupIngredients(ingredients: Ingredient[]): IngredientGroup[] {
  const groups: IngredientGroup[] = [];

  for (const ing of ingredients) {
    const label = ing.group?.trim() ?? '';
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(ing);
    } else {
      groups.push({ label, items: [ing] });
    }
  }

  return groups;
}
