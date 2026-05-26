import { describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import { filterRecipePairSuggestions } from './filterRecipePairSuggestions';

const recipes: Recipe[] = [
  {
    id: '1',
    slug: 'byl-cheese-bread',
    title: 'Cheese Bread',
    description: 'Appetizer',
    imageUrl: '',
    prepMinutes: 0,
    cookMinutes: 0,
    servings: 4,
    tags: [],
    ingredients: [],
    steps: [],
  },
  {
    id: '2',
    slug: 'byl-kfa-chili',
    title: 'KFA Chili',
    description: 'Main dish',
    imageUrl: '',
    prepMinutes: 0,
    cookMinutes: 0,
    servings: 4,
    tags: [],
    ingredients: [],
    steps: [],
  },
];

describe('filterRecipePairSuggestions', () => {
  it('excludes the current recipe and already linked slugs', () => {
    const results = filterRecipePairSuggestions(recipes, {
      query: '',
      currentSlug: 'byl-cheese-bread',
      pairedSlugs: ['byl-kfa-chili'],
    });
    expect(results).toEqual([]);
  });

  it('matches recipes by title', () => {
    const results = filterRecipePairSuggestions(recipes, {
      query: 'chili',
      currentSlug: 'byl-cheese-bread',
      pairedSlugs: [],
    });
    expect(results.map((r) => r.slug)).toEqual(['byl-kfa-chili']);
  });
});
