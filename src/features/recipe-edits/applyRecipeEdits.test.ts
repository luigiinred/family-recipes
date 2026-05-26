import { describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import { applyRecipeEdit, isRecipeRemoved } from './applyRecipeEdits';
import type { RecipeEdit } from './types';

const recipe: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: 'A cozy soup',
  imageUrl: '',
  prepMinutes: 10,
  cookMinutes: 20,
  servings: 4,
  tags: ['soup'],
  ingredients: [{ amount: '1', unit: 'cup', name: 'broth' }],
  steps: ['Simmer soup'],
  notes: 'Family favorite',
};

describe('applyRecipeEdits', () => {
  it('returns the catalog recipe when there is no edit', () => {
    expect(applyRecipeEdit(recipe)).toEqual(recipe);
  });

  it('applies override fields for display', () => {
    const edit: RecipeEdit = {
      slug: 'test-soup',
      overrides: { title: 'Better Soup', steps: ['Boil', 'Simmer'] },
      updatedAt: '2026-05-26T00:00:00.000Z',
    };
    const merged = applyRecipeEdit(recipe, edit);
    expect(merged.title).toBe('Better Soup');
    expect(merged.steps).toEqual(['Boil', 'Simmer']);
    expect(merged.description).toBe('A cozy soup');
  });

  it('applies pairedWith overrides for display', () => {
    const edit: RecipeEdit = {
      slug: 'test-soup',
      overrides: { pairedWith: ['other-recipe'] },
      updatedAt: '2026-05-26T00:00:00.000Z',
    };
    expect(applyRecipeEdit(recipe, edit).pairedWith).toEqual(['other-recipe']);
  });

  it('marks removed recipes', () => {
    const edit: RecipeEdit = {
      slug: 'test-soup',
      removed: true,
      updatedAt: '2026-05-26T00:00:00.000Z',
    };
    expect(isRecipeRemoved(edit)).toBe(true);
    expect(applyRecipeEdit(recipe, edit).title).toBe('Test Soup');
  });
});
