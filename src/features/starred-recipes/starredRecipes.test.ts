import { beforeEach, describe, expect, it } from 'vitest';
import {
  isStarred,
  loadStarredRecipes,
  saveStarredRecipes,
  toggleStarred,
} from './starredRecipes';
import { STORAGE_KEY } from './types';

beforeEach(() => {
  localStorage.clear();
});

describe('starredRecipes', () => {
  it('loads an empty set when nothing is stored', () => {
    expect(loadStarredRecipes()).toEqual(new Set());
  });

  it('persists starred recipe slugs to localStorage', () => {
    saveStarredRecipes(new Set(['test-soup', 'bean-chili']));
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toContain('test-soup');
    expect(loadStarredRecipes()).toEqual(new Set(['test-soup', 'bean-chili']));
  });

  it('toggles a slug on and off', () => {
    const starred = toggleStarred(new Set(), 'test-soup');
    expect(isStarred(starred, 'test-soup')).toBe(true);

    const unstarred = toggleStarred(starred, 'test-soup');
    expect(isStarred(unstarred, 'test-soup')).toBe(false);
  });
});
