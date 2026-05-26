import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_SEARCH_CATEGORIES,
  loadSearchCategories,
  saveSearchCategories,
  SEARCH_CATEGORIES_STORAGE_KEY,
  type SearchCategory,
} from './searchCategories';

describe('searchCategories', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default categories when storage is empty', () => {
    expect(loadSearchCategories()).toEqual(DEFAULT_SEARCH_CATEGORIES);
  });

  it('persists categories to localStorage', () => {
    const custom: SearchCategory[] = [
      { id: 'a', label: 'Toddler friendly', filters: { tags: ['family'] } },
    ];
    saveSearchCategories(custom);
    const raw = localStorage.getItem(SEARCH_CATEGORIES_STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual(custom);
    expect(loadSearchCategories().find((c) => c.id === 'a')).toEqual(custom[0]);
    expect(loadSearchCategories().some((c) => c.id === 'snacks')).toBe(true);
  });

  it('falls back to defaults when stored JSON is invalid', () => {
    localStorage.setItem(SEARCH_CATEGORIES_STORAGE_KEY, 'not-json');
    expect(loadSearchCategories()).toEqual(DEFAULT_SEARCH_CATEGORIES);
  });

  it('adds new default categories missing from stored list', () => {
    const withoutSnacks = DEFAULT_SEARCH_CATEGORIES.filter((c) => c.id !== 'snacks');
    saveSearchCategories(withoutSnacks);
    expect(loadSearchCategories()).toEqual(DEFAULT_SEARCH_CATEGORIES);
  });
});
