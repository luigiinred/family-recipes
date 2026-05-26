import { formatIngredientName, formatIngredientLine } from '@/static-api/units';
import type { Ingredient, Recipe } from '@/static-api/types/recipe';

export type ShoppingListLine = {
  ingredient: Ingredient;
  recipeSlug: string;
  recipeTitle: string;
};

export type ShoppingListGroup = {
  key: string;
  displayName: string;
  lines: ShoppingListLine[];
};

export function ingredientGroupKey(name: string): string {
  return formatIngredientName(name);
}

export function buildShoppingList(recipes: Recipe[]): ShoppingListGroup[] {
  const byKey = new Map<string, ShoppingListGroup>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const trimmedName = ingredient.name.trim();
      if (!trimmedName) continue;

      const key = ingredientGroupKey(trimmedName);
      let group = byKey.get(key);
      if (!group) {
        group = {
          key,
          displayName: formatIngredientName(trimmedName),
          lines: [],
        };
        byKey.set(key, group);
      }

      group.lines.push({
        ingredient,
        recipeSlug: recipe.slug,
        recipeTitle: recipe.title,
      });
    }
  }

  return [...byKey.values()].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }),
  );
}

export function formatShoppingListText(groups: ShoppingListGroup[]): string {
  return groups
    .map((group) => {
      const lines = group.lines
        .map((line) => `  ${formatIngredientLine(line.ingredient)} — ${line.recipeTitle}`)
        .join('\n');
      return `${group.displayName}\n${lines}`;
    })
    .join('\n\n');
}
