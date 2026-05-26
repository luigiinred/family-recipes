import { describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import {
  buildShoppingList,
  formatShoppingListText,
  ingredientGroupKey,
} from './shoppingList';

const soup: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: [],
  ingredients: [
    { amount: '2', unit: 'cups', name: 'Chicken broth' },
    { amount: '1', unit: '', name: 'onion, diced' },
  ],
  steps: [],
};

const salad: Recipe = {
  id: '2',
  slug: 'test-salad',
  title: 'Test Salad',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: [],
  ingredients: [
    { amount: '1', unit: 'cup', name: 'chicken broth' },
    { amount: '2', unit: 'Tbsp', name: 'olive oil' },
  ],
  steps: [],
};

describe('ingredientGroupKey', () => {
  it('normalizes casing and spacing for grouping', () => {
    expect(ingredientGroupKey('  Chicken Broth ')).toBe(ingredientGroupKey('chicken broth'));
  });
});

describe('buildShoppingList', () => {
  it('returns an empty list when there are no recipes', () => {
    expect(buildShoppingList([])).toEqual([]);
  });

  it('groups the same ingredient from multiple recipes', () => {
    const groups = buildShoppingList([soup, salad]);
    const broth = groups.find((g) => g.key === ingredientGroupKey('chicken broth'));
    expect(broth?.displayName).toBe('chicken broth');
    expect(broth?.lines).toHaveLength(2);
    expect(broth?.lines.map((l) => l.recipeTitle).sort()).toEqual(['Test Salad', 'Test Soup']);
  });

  it('sorts groups alphabetically by display name', () => {
    const groups = buildShoppingList([soup, salad]);
    expect(groups.map((g) => g.displayName)).toEqual(['chicken broth', 'olive oil', 'onion, diced']);
  });

  it('keeps each recipe line with amount and unit', () => {
    const groups = buildShoppingList([soup]);
    expect(groups[0]?.lines[0]?.ingredient).toEqual({
      amount: '2',
      unit: 'cups',
      name: 'Chicken broth',
    });
    expect(groups[0]?.lines[0]?.recipeTitle).toBe('Test Soup');
  });
});

describe('formatShoppingListText', () => {
  it('formats groups with recipe usage for clipboard', () => {
    const text = formatShoppingListText(buildShoppingList([soup, salad]));
    expect(text).toContain('chicken broth');
    expect(text).toContain('2 cup chicken broth — Test Soup');
    expect(text).toContain('1 cup chicken broth — Test Salad');
  });
});
