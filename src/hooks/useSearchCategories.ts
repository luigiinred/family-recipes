import { useCallback, useSyncExternalStore } from 'react';
import {
  loadActiveSearchCategoryId,
  loadSearchCategories,
  saveActiveSearchCategoryId,
  saveSearchCategories,
  type SearchCategory,
} from '@/features/search/searchCategories';

let categoriesCache = loadSearchCategories();
let activeCategoryCache = loadActiveSearchCategoryId();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getCategoriesSnapshot() {
  return categoriesCache;
}

function getActiveCategorySnapshot() {
  return activeCategoryCache;
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function setCategories(categories: SearchCategory[]) {
  categoriesCache = categories;
  saveSearchCategories(categories);
  if (activeCategoryCache && !categories.some((c) => c.id === activeCategoryCache)) {
    activeCategoryCache = null;
    saveActiveSearchCategoryId(null);
  }
  notify();
}

function setActiveCategoryId(id: string | null) {
  activeCategoryCache = id;
  saveActiveSearchCategoryId(id);
  notify();
}

export function useSearchCategories() {
  const categories = useSyncExternalStore(subscribe, getCategoriesSnapshot, getCategoriesSnapshot);
  const activeCategoryId = useSyncExternalStore(
    subscribe,
    getActiveCategorySnapshot,
    getActiveCategorySnapshot,
  );

  const updateCategories = useCallback((next: SearchCategory[]) => {
    setCategories(next);
  }, []);

  const selectCategory = useCallback((id: string | null) => {
    setActiveCategoryId(id);
  }, []);

  return {
    categories,
    activeCategoryId,
    updateCategories,
    selectCategory,
  };
}

export function resetSearchCategoriesCache(): void {
  categoriesCache = loadSearchCategories();
  activeCategoryCache = loadActiveSearchCategoryId();
}
