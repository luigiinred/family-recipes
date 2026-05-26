import { describe, expect, it } from 'vitest';
import type { FoodIdea } from '@/static-api/types/foodIdea';
import { filterFoodIdeas } from './filterFoodIdeas';

const chips: FoodIdea = {
  id: '1',
  slug: 'chips-and-dip',
  title: 'Chips and dip',
  description: 'Pantry snack',
  tags: ['pantry', 'no-cook'],
  mealTypes: ['snack', 'side'],
  ideaKind: 'pantry',
};

describe('filterFoodIdeas', () => {
  it('filters by query and tags', () => {
    expect(filterFoodIdeas([chips], { query: 'dip' })).toHaveLength(1);
    expect(filterFoodIdeas([chips], { query: 'pizza' })).toHaveLength(0);
    expect(filterFoodIdeas([chips], { tags: ['pantry'] })).toHaveLength(1);
    expect(filterFoodIdeas([chips], { tags: ['takeout'] })).toHaveLength(0);
  });

  it('filters by meal type', () => {
    expect(filterFoodIdeas([chips], { mealType: 'snack' })).toHaveLength(1);
    expect(filterFoodIdeas([chips], { mealType: 'dinner' })).toHaveLength(0);
  });
});
