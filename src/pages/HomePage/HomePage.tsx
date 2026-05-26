import { useMemo } from 'react';
import { CatalogEmptyState } from '@/components/CatalogEmptyState';
import { HomeCategoryTabs } from '@/components/HomeCategoryTabs/HomeCategoryTabs';
import { RecipeCard } from '@/components/RecipeCard/RecipeCard';
import { Text } from '@/design-system/primitives';
import { filterCatalog } from '@/features/search/filterCatalog';
import { mergeCategoryNavFilters } from '@/features/search/mergeCategoryNavFilters';
import { getCategoryById } from '@/features/search/searchCategories';
import { useRecipeFilters } from '@/features/search/RecipeFilterContext';
import { FoodIdeaCard } from '@/components/FoodIdeaCard/FoodIdeaCard';
import { useFoodIdeas } from '@/hooks/useFoodIdeas';
import { useRecipeCatalog } from '@/hooks/useRecipeCatalog';
import { useSearchCategories } from '@/hooks/useSearchCategories';
import styles from './HomePage.module.css';

export function HomePage() {
  const { recipes, loading: recipesLoading, error: recipesError } = useRecipeCatalog();
  const { ideas, loading: ideasLoading, error: ideasError } = useFoodIdeas();
  const loading = recipesLoading || ideasLoading;
  const error = recipesError ?? ideasError;
  const {
    query,
    tags,
    mealList,
    lowEffortOnly,
    includeIdeas,
    hasActiveFilters,
    clearFilters,
  } = useRecipeFilters();
  const { categories, activeCategoryId, selectCategory } = useSearchCategories();

  const activeCategory = useMemo(
    () => getCategoryById(categories, activeCategoryId),
    [categories, activeCategoryId],
  );

  const filtered = useMemo(
    () =>
      filterCatalog(
        recipes,
        ideas,
        {
          ...mergeCategoryNavFilters(activeCategory?.filters, {
            query,
            tags,
            mealList,
            lowEffortOnly,
          }),
          includeIdeas,
        },
      ),
    [recipes, ideas, activeCategory, query, tags, mealList, lowEffortOnly, includeIdeas],
  );

  const showResultCount = hasActiveFilters || activeCategoryId !== null;
  const canClearFilters = hasActiveFilters || activeCategoryId !== null;

  const handleClearAllFilters = () => {
    clearFilters();
    selectCategory(null);
  };

  if (loading) {
    return <Text variant="muted">Loading catalog…</Text>;
  }

  if (error) {
    return <Text variant="muted">Could not load catalog: {error}</Text>;
  }

  return (
    <>
      <HomeCategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={selectCategory}
      />

      {showResultCount ? (
        <Text variant="muted" className={styles.resultCount}>
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </Text>
      ) : null}

      <ul className={styles.grid}>
        {filtered.map((entry) =>
          entry.kind === 'recipe' ? (
            <RecipeCard key={`recipe-${entry.item.id}`} recipe={entry.item} />
          ) : (
            <FoodIdeaCard key={`idea-${entry.item.id}`} idea={entry.item} />
          ),
        )}
      </ul>

      {filtered.length === 0 ? (
        <CatalogEmptyState
          showClearAll={canClearFilters}
          onClearAll={handleClearAllFilters}
        />
      ) : null}
    </>
  );
}
