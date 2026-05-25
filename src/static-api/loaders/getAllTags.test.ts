import { beforeEach, describe, expect, it } from 'vitest';
import { getAllTags } from './getAllTags';
import { resetRecipeCatalogCache } from './loadRecipeCatalog';

beforeEach(() => {
  resetRecipeCatalogCache();
});

describe('getAllTags', () => {
  it('returns sorted unique tags from the catalog', async () => {
    const tags = await getAllTags();
    expect(tags.length).toBeGreaterThan(10);
    expect(tags).toEqual([...tags].sort());
    expect(new Set(tags).size).toBe(tags.length);
    expect(tags).toContain('slow-cooker');
    expect(tags).toContain('vegetarian');
  });
});
