const COUNT_KEY = 'bento-planner:item-count';
const PICKS_KEY = 'bento-planner:picks';

export const BENTO_ITEM_COUNT_MIN = 3;
export const BENTO_ITEM_COUNT_MAX = 6;
export const BENTO_ITEM_COUNT_DEFAULT = 5;

export function clampBentoItemCount(count: number): number {
  return Math.min(BENTO_ITEM_COUNT_MAX, Math.max(BENTO_ITEM_COUNT_MIN, count));
}

export function loadBentoItemCount(): number {
  if (typeof localStorage === 'undefined') return BENTO_ITEM_COUNT_DEFAULT;
  const raw = localStorage.getItem(COUNT_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : BENTO_ITEM_COUNT_DEFAULT;
  if (Number.isNaN(parsed)) return BENTO_ITEM_COUNT_DEFAULT;
  return clampBentoItemCount(parsed);
}

export function saveBentoItemCount(count: number): void {
  localStorage.setItem(COUNT_KEY, String(clampBentoItemCount(count)));
}

export function loadBentoPicks(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(PICKS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((slug): slug is string => typeof slug === 'string');
  } catch {
    return [];
  }
}

export function saveBentoPicks(slugs: string[]): void {
  localStorage.setItem(PICKS_KEY, JSON.stringify(slugs));
}

export function trimBentoPicksToCount(slugs: string[], count: number): string[] {
  return slugs.slice(0, clampBentoItemCount(count));
}

export function addBentoPick(slugs: string[], slug: string, maxCount: number): string[] {
  if (slugs.includes(slug)) return slugs;
  const limit = clampBentoItemCount(maxCount);
  if (slugs.length >= limit) return slugs;
  return [...slugs, slug];
}

export function removeBentoPick(slugs: string[], slug: string): string[] {
  return slugs.filter((s) => s !== slug);
}
