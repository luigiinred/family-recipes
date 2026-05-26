import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MealList } from '@/static-api/types/recipe';

const INCLUDE_IDEAS_KEY = 'recipes-include-ideas';

function readIncludeIdeas(): boolean {
  try {
    return localStorage.getItem(INCLUDE_IDEAS_KEY) === 'true';
  } catch {
    return false;
  }
}

export type RecipeFilterState = {
  query: string;
  tags: string[];
  mealList?: MealList;
  lowEffortOnly: boolean;
  includeIdeas: boolean;
};

type RecipeFilterContextValue = RecipeFilterState & {
  setQuery: (query: string) => void;
  addTag: (tag: string) => void;
  toggleTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearTags: () => void;
  setMealList: (mealList: MealList | undefined) => void;
  setLowEffortOnly: (on: boolean) => void;
  setIncludeIdeas: (on: boolean) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
};

const RecipeFilterContext = createContext<RecipeFilterContextValue | null>(null);

export function RecipeFilterProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mealList, setMealList] = useState<MealList | undefined>();
  const [lowEffortOnly, setLowEffortOnly] = useState(false);
  const [includeIdeas, setIncludeIdeasState] = useState(readIncludeIdeas);

  const setIncludeIdeas = useCallback((on: boolean) => {
    setIncludeIdeasState(on);
    try {
      localStorage.setItem(INCLUDE_IDEAS_KEY, on ? 'true' : 'false');
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const addTag = useCallback((tag: string) => {
    setTags((current) =>
      current.includes(tag) ? current : [...current, tag].sort(),
    );
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag].sort(),
    );
  }, []);

  const removeTag = useCallback((tag: string) => {
    setTags((current) => current.filter((t) => t !== tag));
  }, []);

  const clearTags = useCallback(() => setTags([]), []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setTags([]);
    setMealList(undefined);
    setLowEffortOnly(false);
    setIncludeIdeas(false);
  }, [setIncludeIdeas]);

  const hasActiveFilters =
    query.trim().length > 0 || tags.length > 0 || mealList !== undefined || lowEffortOnly;

  const value = useMemo<RecipeFilterContextValue>(
    () => ({
      query,
      tags,
      mealList,
      lowEffortOnly,
      includeIdeas,
      setQuery,
      addTag,
      toggleTag,
      removeTag,
      clearTags,
      setMealList,
      setLowEffortOnly,
      setIncludeIdeas,
      clearFilters,
      hasActiveFilters,
    }),
    [
      query,
      tags,
      mealList,
      lowEffortOnly,
      includeIdeas,
      addTag,
      toggleTag,
      removeTag,
      clearTags,
      setIncludeIdeas,
      clearFilters,
      hasActiveFilters,
    ],
  );

  return (
    <RecipeFilterContext.Provider value={value}>{children}</RecipeFilterContext.Provider>
  );
}

export function useRecipeFilters(): RecipeFilterContextValue {
  const ctx = useContext(RecipeFilterContext);
  if (!ctx) {
    throw new Error('useRecipeFilters must be used within RecipeFilterProvider');
  }
  return ctx;
}
