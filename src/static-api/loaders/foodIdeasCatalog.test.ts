import { beforeEach, describe, expect, it } from 'vitest';
import { getFoodIdeaBySlug } from './getFoodIdeaBySlug';
import { getFoodIdeas } from './getFoodIdeas';
import {
  loadFoodIdeasCatalog,
  resetFoodIdeasCatalogCache,
} from './loadFoodIdeasCatalog';

beforeEach(() => {
  resetFoodIdeasCatalogCache();
});

describe('food ideas catalog', () => {
  it('loads ideas from JSON', async () => {
    const ideas = await getFoodIdeas();
    expect(ideas.length).toBeGreaterThan(0);
    expect(ideas[0]?.slug).toBeTruthy();
    expect(ideas[0]?.mealTypes?.length).toBeGreaterThan(0);
  });

  it('looks up an idea by slug', async () => {
    const idea = await getFoodIdeaBySlug('chips-and-dip');
    expect(idea?.title).toBe('Chips and dip');
    expect(idea?.ideaKind).toBe('pantry');
  });

  it('returns undefined for unknown slug', async () => {
    expect(await getFoodIdeaBySlug('not-an-idea')).toBeUndefined();
  });

  it('caches catalog in memory', async () => {
    const first = await loadFoodIdeasCatalog();
    const second = await loadFoodIdeasCatalog();
    expect(second).toBe(first);
  });
});
