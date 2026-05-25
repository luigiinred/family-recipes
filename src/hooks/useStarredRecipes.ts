import { useCallback, useSyncExternalStore } from 'react';
import {
  isStarred as checkStarred,
  loadStarredRecipes,
  saveStarredRecipes,
  toggleStarred,
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

function setStarred(next: Set<string>) {
  cache = next;
  saveStarredRecipes(next);
  for (const listener of listeners) {
    listener();
  }
}

export function useStarredRecipes() {
  const starred = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const isStarred = useCallback((slug: string) => checkStarred(starred, slug), [starred]);

  const toggleStar = useCallback(
    (slug: string) => {
      setStarred(toggleStarred(starred, slug));
    },
    [starred],
  );

  return { isStarred, toggleStar };
}

/** Reset in-memory cache for tests */
export function resetStarredRecipesCache(): void {
  cache = loadStarredRecipes();
}
