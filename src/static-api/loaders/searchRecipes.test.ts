import { beforeEach, describe, expect, it } from 'vitest';
import { resetRecipeCatalogCache } from './loadRecipeCatalog';
import { searchRecipes } from './searchRecipes';

beforeEach(() => {
  resetRecipeCatalogCache();
});

describe('searchRecipes', () => {
  it('returns all recipes when query is empty', async () => {
    const all = await searchRecipes('');
    expect(all).toHaveLength(74);
  });

  it('matches title case-insensitively', async () => {
    const results = await searchRecipes('briam');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.slug === 'briam')).toBe(true);
  });

  it('matches tags and description', async () => {
    const slow = await searchRecipes('slow-cooker');
    expect(slow.length).toBeGreaterThanOrEqual(2);
    const salad = await searchRecipes('mediterranean');
    expect(salad.some((r) => r.slug === 'mediterranean-salad')).toBe(true);
  });
});
