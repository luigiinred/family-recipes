import { useCallback } from 'react';
import { Button, Text } from '@/design-system/primitives';
import { useSearchCategories } from '@/hooks/useSearchCategories';
import { MEAL_TYPE_LABELS, MEAL_TYPES } from '@/static-api/mealTypes';
import { MEAL_LISTS, type MealList } from '@/static-api/types/recipe';
import {
  createSearchCategoryId,
  type SearchCategory,
  type SearchCategoryFilters,
} from './searchCategories';
import styles from './SearchCategoriesSettings.module.css';

const MEAL_LIST_LABELS: Record<MealList, string> = {
  'to-make': 'To make',
  'to-eat': 'To eat',
  'healthy-ideas': 'Healthy ideas',
  saved: 'Saved',
  'freezer-meals': 'Freezer',
};

function updateCategory(
  categories: SearchCategory[],
  id: string,
  patch: Partial<Pick<SearchCategory, 'label' | 'filters'>>,
): SearchCategory[] {
  return categories.map((c) => (c.id === id ? { ...c, ...patch, filters: { ...c.filters, ...patch.filters } } : c));
}

export function SearchCategoriesSettings() {
  const { categories, updateCategories } = useSearchCategories();

  const persist = useCallback(
    (next: SearchCategory[]) => {
      updateCategories(next);
    },
    [updateCategories],
  );

  const handleLabelChange = (id: string, label: string) => {
    persist(updateCategory(categories, id, { label }));
  };

  const handleTagsChange = (id: string, value: string) => {
    const tags = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const filters: SearchCategoryFilters = { ...categories.find((c) => c.id === id)?.filters };
    if (tags.length > 0) filters.tags = [...new Set(tags)].sort();
    else delete filters.tags;
    persist(updateCategory(categories, id, { filters }));
  };

  const handleMealTypeChange = (id: string, value: string) => {
    const filters: SearchCategoryFilters = { ...categories.find((c) => c.id === id)?.filters };
    if (value) filters.mealType = value as SearchCategoryFilters['mealType'];
    else delete filters.mealType;
    persist(updateCategory(categories, id, { filters }));
  };

  const handleMealListChange = (id: string, value: string) => {
    const filters: SearchCategoryFilters = { ...categories.find((c) => c.id === id)?.filters };
    if (value) filters.mealList = value as MealList;
    else delete filters.mealList;
    persist(updateCategory(categories, id, { filters }));
  };

  const handleEffortChange = (id: string, checked: boolean) => {
    const filters: SearchCategoryFilters = { ...categories.find((c) => c.id === id)?.filters };
    if (checked) filters.effort = 'low';
    else delete filters.effort;
    persist(updateCategory(categories, id, { filters }));
  };

  const handleAdd = () => {
    const id = createSearchCategoryId();
    persist([
      ...categories,
      { id, label: 'New category', filters: {} },
    ]);
  };

  const handleRemove = (id: string) => {
    if (categories.length <= 1) return;
    if (!window.confirm('Remove this category tab?')) return;
    persist(categories.filter((c) => c.id !== id));
  };

  const handleReset = () => {
    if (!window.confirm('Reset categories to defaults? Your custom tabs will be replaced.')) return;
    localStorage.removeItem('recipes-search-categories-v1');
    window.location.reload();
  };

  return (
    <>
      <Text variant="muted">
        Home page tabs apply these filters. The last tab is always All recipes. Header search
        refines within the active category.
      </Text>

      <ul className={styles.list}>
        {categories.map((category) => (
          <li key={category.id} className={styles.card}>
            <label className={styles.field}>
              Category name
              <input
                type="text"
                value={category.label}
                aria-label={`Category name for ${category.label}`}
                onChange={(e) => handleLabelChange(category.id, e.target.value)}
              />
            </label>

            <label className={styles.field}>
              Tags (comma-separated)
              <input
                type="text"
                value={(category.filters.tags ?? []).join(', ')}
                aria-label={`Tags for ${category.label}`}
                placeholder="family, vegetarian"
                onChange={(e) => handleTagsChange(category.id, e.target.value)}
              />
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                Meal type
                <select
                  value={category.filters.mealType ?? ''}
                  aria-label={`Meal type for ${category.label}`}
                  onChange={(e) => handleMealTypeChange(category.id, e.target.value)}
                >
                  <option value="">Any</option>
                  {MEAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {MEAL_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                Meal list
                <select
                  value={category.filters.mealList ?? ''}
                  aria-label={`Meal list for ${category.label}`}
                  onChange={(e) => handleMealListChange(category.id, e.target.value)}
                >
                  <option value="">Any</option>
                  {MEAL_LISTS.map((list) => (
                    <option key={list} value={list}>
                      {MEAL_LIST_LABELS[list]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={styles.field}>
              <input
                type="checkbox"
                checked={category.filters.effort === 'low'}
                onChange={(e) => handleEffortChange(category.id, e.target.checked)}
              />{' '}
              Low effort only
            </label>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleRemove(category.id)}
                disabled={categories.length <= 1}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button type="button" onClick={handleAdd}>
          Add category
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          Reset to defaults
        </Button>
      </div>
    </>
  );
}
