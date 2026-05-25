import { STORAGE_KEY } from './types';

export type StarredRecipes = Set<string>;

export function loadStarredRecipes(): StarredRecipes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((slug): slug is string => typeof slug === 'string'));
  } catch {
    return new Set();
  }
}

export function saveStarredRecipes(starred: StarredRecipes): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...starred]));
}

export function isStarred(starred: StarredRecipes, slug: string): boolean {
  return starred.has(slug);
}

export function toggleStarred(starred: StarredRecipes, slug: string): StarredRecipes {
  const next = new Set(starred);
  if (next.has(slug)) {
    next.delete(slug);
  } else {
    next.add(slug);
  }
  return next;
}
