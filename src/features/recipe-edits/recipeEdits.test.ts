import { beforeEach, describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import {
  clearRecipeEdit,
  exportRecipeEditsForCursor,
  loadRecipeEdits,
  saveRecipeEdit,
  upsertRecipeEdit,
} from './recipeEdits';
import { STORAGE_KEY } from './types';

const baseRecipe: Recipe = {
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
};

describe('recipeEdits storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty store when nothing is saved', () => {
    expect(loadRecipeEdits().edits).toEqual({});
  });

  it('persists edits to localStorage', () => {
    saveRecipeEdit({
      slug: 'test-soup',
      overrides: { title: 'Better Soup' },
      updatedAt: '2026-05-26T00:00:00.000Z',
    });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toContain('Better Soup');
    expect(loadRecipeEdits().edits['test-soup']?.overrides?.title).toBe('Better Soup');
  });

  it('persists tag-only overrides', () => {
    upsertRecipeEdit('test-soup', { overrides: { tags: ['soup', 'vegetarian'] } });
    expect(loadRecipeEdits().edits['test-soup']?.overrides?.tags).toEqual(['soup', 'vegetarian']);
  });

  it('merges partial updates onto an existing edit', () => {
    upsertRecipeEdit('test-soup', { overrides: { title: 'Draft title' } });
    upsertRecipeEdit('test-soup', { aiNotes: { ingredients: 'Double the broth' } });
    const edit = loadRecipeEdits().edits['test-soup'];
    expect(edit?.overrides?.title).toBe('Draft title');
    expect(edit?.aiNotes?.ingredients).toBe('Double the broth');
  });

  it('clears an edit when it has no meaningful changes', () => {
    upsertRecipeEdit('test-soup', { removed: true });
    clearRecipeEdit('test-soup');
    expect(loadRecipeEdits().edits['test-soup']).toBeUndefined();
  });

  it('exports all edits for Cursor with catalog context', () => {
    upsertRecipeEdit('test-soup', {
      removed: false,
      overrides: { title: 'Better Soup' },
      aiNotes: { global: 'Keep tone friendly' },
    });
    const exported = exportRecipeEditsForCursor(loadRecipeEdits(), [baseRecipe]);
    expect(exported.edits).toHaveLength(1);
    expect(exported.edits[0].slug).toBe('test-soup');
    expect(exported.edits[0].catalogTitle).toBe('Test Soup');
    expect(exported.targetFile).toContain('recipes.json');
    expect(exported.deletedRecipes).toEqual([]);
  });

  it('lists deleted recipes in export for Cursor', () => {
    upsertRecipeEdit('test-soup', { removed: true, aiNotes: { remove: 'Duplicate' } });
    const exported = exportRecipeEditsForCursor(loadRecipeEdits(), [baseRecipe]);
    expect(exported.deletedRecipes).toEqual([
      { slug: 'test-soup', catalogTitle: 'Test Soup', aiNote: 'Duplicate' },
    ]);
    expect(exported.purpose).toContain('deletedRecipes');
  });
});
