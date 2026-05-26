import { beforeEach, describe, expect, it } from 'vitest';
import { getBentoIdeaBySlug } from './getBentoIdeaBySlug';
import { getBentoIdeas } from './getBentoIdeas';
import { groupBentoIdeasBySection } from './groupBentoIdeasBySection';
import {
  loadBentoIdeasCatalog,
  resetBentoIdeasCatalogCache,
} from './loadBentoIdeasCatalog';
import { BENTO_SECTION_ORDER } from '../types/bentoIdea';

beforeEach(() => {
  resetBentoIdeasCatalogCache();
});

describe('bento ideas catalog', () => {
  it('loads ideas from JSON', async () => {
    const ideas = await getBentoIdeas();
    expect(ideas.length).toBeGreaterThan(0);
    expect(ideas[0]?.slug).toBeTruthy();
    expect(ideas[0]?.section).toBeTruthy();
  });

  it('looks up an idea by slug', async () => {
    const idea = await getBentoIdeaBySlug('cheese-zips');
    expect(idea?.title).toBe('Cheese Zips');
    expect(idea?.section).toBe('snack');
  });

  it('returns undefined for unknown slug', async () => {
    expect(await getBentoIdeaBySlug('not-a-bento-idea')).toBeUndefined();
  });

  it('groups ideas by section in display order', async () => {
    const ideas = await getBentoIdeas();
    const grouped = groupBentoIdeasBySection(ideas);
    expect(Object.keys(grouped)).toEqual(BENTO_SECTION_ORDER);
    expect(grouped.snack.some((i) => i.slug === 'goldfish-crackers')).toBe(true);
    expect(grouped.main.some((i) => i.slug === 'rice-balls')).toBe(true);
  });

  it('caches catalog in memory', async () => {
    const first = await loadBentoIdeasCatalog();
    const second = await loadBentoIdeasCatalog();
    expect(second).toBe(first);
  });
});
