import { beforeEach, describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import { patchRecipePairedWith } from './patchRecipePairedWith';

const catalogRecipe: Recipe = {
  id: '1',
  slug: 'byl-cheese-bread',
  title: 'Cheese Bread',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: [],
  ingredients: [],
  steps: [],
  pairedWith: ['byl-kfa-chili'],
};

describe('patchRecipePairedWith', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores pairedWith when different from catalog', () => {
    const edit = patchRecipePairedWith('byl-cheese-bread', catalogRecipe, undefined, [
      'byl-kfa-chili',
      'briam',
    ]);
    expect(edit.overrides?.pairedWith).toEqual(['briam', 'byl-kfa-chili']);
  });

  it('clears override when pairings match catalog again', () => {
    const edit = patchRecipePairedWith('byl-cheese-bread', catalogRecipe, {
      slug: 'byl-cheese-bread',
      updatedAt: '',
      overrides: { pairedWith: ['briam'] },
    }, ['byl-kfa-chili']);
    expect(edit.overrides?.pairedWith).toBeUndefined();
  });
});
