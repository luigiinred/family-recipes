import type { MealType } from '@/static-api/mealTypes';
import { MEAL_TYPES } from '@/static-api/mealTypes';
import type { Effort, MealList } from '@/static-api/types/recipe';
import { MEAL_LISTS } from '@/static-api/types/recipe';

export const SEARCH_CATEGORIES_STORAGE_KEY = 'recipes-search-categories-v1';
export const ACTIVE_SEARCH_CATEGORY_STORAGE_KEY = 'recipes-active-search-category-v1';

export type SearchCategoryFilters = {
  tags?: string[];
  mealList?: MealList;
  effort?: Effort;
  mealType?: MealType;
};

export type SearchCategory = {
  id: string;
  label: string;
  filters: SearchCategoryFilters;
};

export const DEFAULT_SEARCH_CATEGORIES: SearchCategory[] = [
  { id: 'dinner', label: 'Dinner', filters: { mealType: 'dinner' } },
  { id: 'lunch', label: 'Lunch', filters: { mealType: 'lunch' } },
  { id: 'dessert', label: 'Dessert', filters: { mealType: 'dessert' } },
  { id: 'snacks', label: 'Snacks', filters: { mealType: 'snack' } },
];

const DEFAULT_CATEGORY_IDS = new Set(DEFAULT_SEARCH_CATEGORIES.map((c) => c.id));

function mergeWithDefaultCategories(stored: SearchCategory[]): SearchCategory[] {
  const byId = new Map(stored.map((c) => [c.id, c]));
  const merged = DEFAULT_SEARCH_CATEGORIES.map((def) => byId.get(def.id) ?? def);
  for (const category of stored) {
    if (!DEFAULT_CATEGORY_IDS.has(category.id)) {
      merged.push(category);
    }
  }
  return merged;
}

function isMealList(value: unknown): value is MealList {
  return typeof value === 'string' && (MEAL_LISTS as readonly string[]).includes(value);
}

function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && (MEAL_TYPES as readonly string[]).includes(value);
}

function isEffort(value: unknown): value is Effort {
  return value === 'low' || value === 'medium' || value === 'high';
}

function parseFilters(raw: unknown): SearchCategoryFilters {
  if (!raw || typeof raw !== 'object') return {};
  const record = raw as Record<string, unknown>;
  const filters: SearchCategoryFilters = {};
  if (Array.isArray(record.tags)) {
    const tags = record.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);
    if (tags.length > 0) filters.tags = [...new Set(tags)].sort();
  }
  if (isMealList(record.mealList)) filters.mealList = record.mealList;
  if (isMealType(record.mealType)) filters.mealType = record.mealType;
  if (isEffort(record.effort)) filters.effort = record.effort;
  return filters;
}

function parseCategory(raw: unknown): SearchCategory | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== 'string' || !record.id.trim()) return null;
  if (typeof record.label !== 'string' || !record.label.trim()) return null;
  return {
    id: record.id.trim(),
    label: record.label.trim(),
    filters: parseFilters(record.filters),
  };
}

export function loadSearchCategories(): SearchCategory[] {
  try {
    const raw = localStorage.getItem(SEARCH_CATEGORIES_STORAGE_KEY);
    if (!raw) return [...DEFAULT_SEARCH_CATEGORIES];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_SEARCH_CATEGORIES];
    const categories = parsed.map(parseCategory).filter((c): c is SearchCategory => c !== null);
    return categories.length > 0 ? mergeWithDefaultCategories(categories) : [...DEFAULT_SEARCH_CATEGORIES];
  } catch {
    return [...DEFAULT_SEARCH_CATEGORIES];
  }
}

export function saveSearchCategories(categories: SearchCategory[]): void {
  localStorage.setItem(SEARCH_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
}

export function loadActiveSearchCategoryId(): string | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SEARCH_CATEGORY_STORAGE_KEY);
    if (raw === null || raw === '') return null;
    return raw;
  } catch {
    return null;
  }
}

export function saveActiveSearchCategoryId(id: string | null): void {
  if (id === null) {
    localStorage.removeItem(ACTIVE_SEARCH_CATEGORY_STORAGE_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_SEARCH_CATEGORY_STORAGE_KEY, id);
}

export function createSearchCategoryId(): string {
  return `cat-${Date.now().toString(36)}`;
}

export function getCategoryById(
  categories: SearchCategory[],
  id: string | null,
): SearchCategory | undefined {
  if (!id) return undefined;
  return categories.find((c) => c.id === id);
}
