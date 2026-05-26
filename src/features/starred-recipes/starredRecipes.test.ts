import { beforeEach, describe, expect, it } from 'vitest';
import {
  isStarred,
  loadStarredRecipes,
  moveStarred,
  saveStarredRecipes,
  toggleStarred,
} from './starredRecipes';
import { STORAGE_KEY } from './types';

beforeEach(() => {
  localStorage.clear();
});

describe('starredRecipes', () => {
  it('loads an empty list when nothing is stored', () => {
    expect(loadStarredRecipes()).toEqual([]);
  });

  it('persists starred recipe slugs to localStorage in order', () => {
    saveStarredRecipes(['test-soup', 'bean-chili']);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toContain('test-soup');
    expect(loadStarredRecipes()).toEqual(['test-soup', 'bean-chili']);
  });

  it('toggles a slug on at the end and off', () => {
    const starred = toggleStarred([], 'test-soup');
    expect(isStarred(starred, 'test-soup')).toBe(true);
    expect(starred).toEqual(['test-soup']);

    const withSecond = toggleStarred(starred, 'bean-chili');
    expect(withSecond).toEqual(['test-soup', 'bean-chili']);

    const unstarred = toggleStarred(withSecond, 'test-soup');
    expect(isStarred(unstarred, 'test-soup')).toBe(false);
    expect(unstarred).toEqual(['bean-chili']);
  });

  it('moves a slug to a new index', () => {
    const order = moveStarred(['a', 'b', 'c'], 0, 2);
    expect(order).toEqual(['b', 'c', 'a']);
  });

  it('dedupes slugs while preserving first occurrence', () => {
    saveStarredRecipes(['a', 'b', 'a', 'c', 'b']);
    expect(loadStarredRecipes()).toEqual(['a', 'b', 'c']);
  });
});
