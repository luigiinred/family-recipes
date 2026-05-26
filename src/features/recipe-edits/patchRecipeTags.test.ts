import { beforeEach, describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import { patchRecipeTags } from './patchRecipeTags';

const catalogRecipe: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['soup'],
  ingredients: [],
  steps: [],
};

describe('patchRecipeTags', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores normalized tags when different from catalog', () => {
    const edit = patchRecipeTags('test-soup', catalogRecipe, undefined, ['soup', 'Slow Cooker']);
    expect(edit.overrides?.tags).toEqual(['soup', 'slow-cooker']);
  });

  it('clears override when tags match catalog again', () => {
    const edit = patchRecipeTags('test-soup', catalogRecipe, { slug: 'test-soup', updatedAt: '' }, [
      'soup',
    ]);
    expect(edit.overrides?.tags).toBeUndefined();
  });
});
