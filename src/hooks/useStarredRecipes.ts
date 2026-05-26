import { useCallback, useSyncExternalStore } from 'react';
import {
  isStarred as checkStarred,
  loadStarredRecipes,
  moveStarred,
  saveStarredRecipes,
  toggleStarred,
  type StarredSlugs,
} from '@/features/starred-recipes/starredRecipes';

let cache = loadStarredRecipes();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cache;
}

function setStarred(next: StarredSlugs) {
  cache = next;
  saveStarredRecipes(next);
  for (const listener of listeners) {
    listener();
  }
}

export function useStarredRecipes() {
  const starredSlugs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const isStarred = useCallback((slug: string) => checkStarred(starredSlugs, slug), [starredSlugs]);

  const toggleStar = useCallback(
    (slug: string) => {
      setStarred(toggleStarred(starredSlugs, slug));
    },
    [starredSlugs],
  );

  const moveStar = useCallback(
    (fromIndex: number, toIndex: number) => {
      setStarred(moveStarred(starredSlugs, fromIndex, toIndex));
    },
    [starredSlugs],
  );

  return { starredSlugs, isStarred, toggleStar, moveStar };
}

/** Reset in-memory cache for tests */
export function resetStarredRecipesCache(): void {
  cache = loadStarredRecipes();
}
