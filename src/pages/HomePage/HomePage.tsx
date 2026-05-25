import { useMemo, useState } from 'react';
import { RecipeCard } from '@/components/RecipeCard/RecipeCard';
import { RecipeSearch } from '@/components/RecipeSearch/RecipeSearch';
import { TagFilter } from '@/components/TagFilter/TagFilter';
import { TagPicker } from '@/components/TagPicker/TagPicker';
import { Stack, Text } from '@/design-system/primitives';
import { filterRecipes } from '@/features/search/filterRecipes';
import { useAllTags } from '@/hooks/useAllTags';
import { useRecipeCatalog } from '@/hooks/useRecipeCatalog';
import { QUICK_TAGS } from '@/static-api/tags';
import { MEAL_LISTS, type MealList } from '@/static-api/types/recipe';
import styles from './HomePage.module.css';

const MEAL_LIST_LABELS: Record<MealList, string> = {
  'to-make': 'To make',
  'to-eat': 'To eat',
  'healthy-ideas': 'Healthy ideas',
  saved: 'Saved',
  'freezer-meals': 'Freezer',
};

function normalizeTagInput(input: string): string | undefined {
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function HomePage() {
  const { recipes, loading, error } = useRecipeCatalog();
  const allTags = useAllTags();
  const [query, setQuery] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [chipTag, setChipTag] = useState<string | undefined>();
  const [mealList, setMealList] = useState<MealList | undefined>();
  const [lowEffortOnly, setLowEffortOnly] = useState(false);

  const activeTag = chipTag ?? normalizeTagInput(tagInput);

  const filtered = useMemo(
    () =>
      filterRecipes(recipes, {
        query,
        tag: activeTag,
        mealList,
        effort: lowEffortOnly ? 'low' : undefined,
      }),
    [recipes, query, activeTag, mealList, lowEffortOnly],
  );

  if (loading) {
    return <Text variant="muted">Loading recipes…</Text>;
  }

  if (error) {
    return <Text variant="muted">Could not load recipes: {error}</Text>;
  }

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Text as="h1" variant="title">
          Recipes
        </Text>
        <Text variant="muted">{recipes.length} recipes in your catalog</Text>
      </Stack>

      <RecipeSearch value={query} onChange={setQuery} />
      <TagFilter tags={allTags} value={tagInput} onChange={setTagInput} />

      <Stack gap="sm">
        <Text variant="label">Quick tags</Text>
        <TagPicker
          tags={[...QUICK_TAGS]}
          activeTag={activeTag}
          onSelect={(tag) => {
            setChipTag(chipTag === tag ? undefined : tag);
            setTagInput(chipTag === tag ? '' : tag);
          }}
        />
      </Stack>

      <Stack gap="sm">
        <Text variant="label">Effort</Text>
        <div className={styles.filters}>
          <button
            type="button"
            className={[styles.filter, lowEffortOnly ? styles.filterActive : ''].join(' ')}
            onClick={() => setLowEffortOnly((on) => !on)}
          >
            Low effort
          </button>
        </div>
      </Stack>

      <Stack gap="sm">
        <Text variant="label">Lists</Text>
        <div className={styles.filters}>
          <button
            type="button"
            className={[styles.filter, !mealList ? styles.filterActive : ''].join(' ')}
            onClick={() => setMealList(undefined)}
          >
            All
          </button>
          {MEAL_LISTS.map((list) => (
            <button
              key={list}
              type="button"
              className={[styles.filter, mealList === list ? styles.filterActive : ''].join(' ')}
              onClick={() => setMealList(list)}
            >
              {MEAL_LIST_LABELS[list]}
            </button>
          ))}
        </div>
      </Stack>

      <Text variant="muted">
        {filtered.length} result{filtered.length === 1 ? '' : 's'}
        {activeTag ? ` · tag “${activeTag}”` : ''}
        {lowEffortOnly ? ' · low effort' : ''}
      </Text>

      <ul className={styles.grid}>
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </ul>

      {filtered.length === 0 ? (
        <Text variant="muted">No recipes match. Try another search or filter.</Text>
      ) : null}
    </Stack>
  );
}
