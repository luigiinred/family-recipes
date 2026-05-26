import { describe, expect, it } from 'vitest';
import type { FoodIdea } from '@/static-api/types/foodIdea';
import type { Recipe } from '@/static-api/types/recipe';
import { filterCatalog } from './filterCatalog';

const recipe: Recipe = {
  id: '1',
  slug: 'soup',
  title: 'Tomato Soup',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['soup'],
  ingredients: [],
  steps: [],
  mealLists: ['saved'],
  effort: 'high',
};

const idea: FoodIdea = {
  id: '2',
  slug: 'takeout-pizza',
  title: 'Takeout pizza',
  tags: ['takeout'],
  mealTypes: ['dinner'],
};

describe('filterCatalog', () => {
  it('omits ideas unless includeIdeas is true', () => {
    expect(filterCatalog([recipe], [idea], {}).map((r) => r.kind)).toEqual(['recipe']);
    const withIdeas = filterCatalog([recipe], [idea], { includeIdeas: true });
    expect(withIdeas).toHaveLength(2);
    expect(withIdeas.map((r) => r.kind)).toContain('idea');
  });

  it('omits ideas when a meal list filter is active', () => {
    const results = filterCatalog([recipe], [idea], { mealList: 'saved' });
    expect(results.every((r) => r.kind === 'recipe')).toBe(true);
  });

  it('omits ideas when filtering non-low effort', () => {
    const results = filterCatalog([recipe], [idea], { effort: 'high' });
    expect(results).toEqual([{ kind: 'recipe', item: recipe }]);
  });

  it('keeps ideas when filtering low effort and includeIdeas is on', () => {
    const low: Recipe = { ...recipe, slug: 'fast', effort: 'low' };
    const results = filterCatalog([recipe, low], [idea], { effort: 'low', includeIdeas: true });
    expect(results.some((r) => r.kind === 'idea')).toBe(true);
    expect(results.filter((r) => r.kind === 'recipe')).toHaveLength(1);
  });
});
