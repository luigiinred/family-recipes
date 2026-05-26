import { describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import { filterRecipes } from './filterRecipes';

const base: Recipe = {
  id: '1',
  slug: 'a',
  title: 'Tomato Soup',
  description: 'Comfort food',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['soup', 'vegetarian'],
  ingredients: [{ amount: '2', unit: 'cups', name: 'tomatoes' }],
  steps: ['Simmer'],
  mealLists: ['saved'],
};

describe('filterRecipes', () => {
  it('returns all when no filters', () => {
    expect(filterRecipes([base], {})).toHaveLength(1);
  });

  it('filters by query across ingredients', () => {
    expect(filterRecipes([base], { query: 'tomatoes' })).toHaveLength(1);
    expect(filterRecipes([base], { query: 'pasta' })).toHaveLength(0);
  });

  it('filters by tag and meal list', () => {
    expect(filterRecipes([base], { tag: 'soup' })).toHaveLength(1);
    expect(filterRecipes([base], { mealList: 'saved' })).toHaveLength(1);
    expect(filterRecipes([base], { mealList: 'to-make' })).toHaveLength(0);
  });

  it('filters by multiple tags (all must match)', () => {
    const other: Recipe = {
      ...base,
      id: '2',
      slug: 'b',
      title: 'Pasta',
      tags: ['soup'],
    };
    expect(filterRecipes([base, other], { tags: ['soup', 'vegetarian'] })).toEqual([base]);
    expect(filterRecipes([base, other], { tags: ['soup'] })).toHaveLength(2);
  });

  it('filters by low effort', () => {
    const low: Recipe = { ...base, slug: 'low', effort: 'low' };
    const other: Recipe = { ...base, id: '2', slug: 'other', effort: 'high' };
    const unset: Recipe = { ...base, id: '3', slug: 'unset' };
    expect(filterRecipes([low, other, unset], { effort: 'low' })).toEqual([low]);
  });

  it('filters by meal type using resolved meal types', () => {
    const dinner: Recipe = {
      ...base,
      id: '2',
      slug: 'steak',
      title: 'Steak Dinner',
      tags: [],
      mealTypes: ['dinner'],
    };
    const dessert: Recipe = {
      ...base,
      id: '3',
      slug: 'cake',
      title: 'Chocolate Cake',
      tags: ['dessert'],
    };
    expect(filterRecipes([dinner, dessert], { mealType: 'dinner' })).toEqual([dinner]);
    expect(filterRecipes([dinner, dessert], { mealType: 'dessert' })).toEqual([dessert]);
  });
});
