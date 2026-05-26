import { STORAGE_KEY } from './types';

/** Starred recipe slugs in display / cook order (first = next up). */
export type StarredSlugs = string[];

export function loadStarredRecipes(): StarredSlugs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return dedupeStarredSlugs(
      parsed.filter((slug): slug is string => typeof slug === 'string'),
    );
  } catch {
    return [];
  }
}

export function dedupeStarredSlugs(slugs: string[]): StarredSlugs {
  const seen = new Set<string>();
  const next: StarredSlugs = [];
  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    next.push(slug);
  }
  return next;
}

export function saveStarredRecipes(starred: StarredSlugs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupeStarredSlugs(starred)));
}

export function isStarred(starred: StarredSlugs, slug: string): boolean {
  return starred.includes(slug);
}

export function toggleStarred(starred: StarredSlugs, slug: string): StarredSlugs {
  const index = starred.indexOf(slug);
  if (index >= 0) {
    return starred.filter((s) => s !== slug);
  }
  return [...starred, slug];
}

export function moveStarred(
  starred: StarredSlugs,
  fromIndex: number,
  toIndex: number,
): StarredSlugs {
  if (fromIndex === toIndex) return starred;
  if (fromIndex < 0 || fromIndex >= starred.length) return starred;
  if (toIndex < 0 || toIndex >= starred.length) return starred;
  const next = [...starred];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}
