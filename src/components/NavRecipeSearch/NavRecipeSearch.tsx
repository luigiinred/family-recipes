import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRecipeFilters } from '@/features/search/RecipeFilterContext';
import { useAllTags } from '@/hooks/useAllTags';
import { QUICK_TAGS } from '@/static-api/tags';
import { MEAL_LISTS, type MealList } from '@/static-api/types/recipe';
import styles from './NavRecipeSearch.module.css';

const MEAL_LIST_LABELS: Record<MealList, string> = {
  'to-make': 'To make',
  'to-eat': 'To eat',
  'healthy-ideas': 'Healthy ideas',
  saved: 'Saved',
  'freezer-meals': 'Freezer',
};

export function NavRecipeSearch() {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const allTags = useAllTags();
  const {
    query,
    tags,
    mealList,
    lowEffortOnly,
    includeIdeas,
    setQuery,
    toggleTag,
    removeTag,
    setMealList,
    setLowEffortOnly,
    setIncludeIdeas,
    clearFilters,
    hasActiveFilters,
  } = useRecipeFilters();

  const quickTagSet = useMemo(() => new Set<string>(QUICK_TAGS), []);
  const extraTags = useMemo(
    () => allTags.filter((tag) => !quickTagSet.has(tag)),
    [allTags, quickTagSet],
  );

  useEffect(() => {
    if (!panelOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
        setShowAllTags(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [panelOpen]);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchPlaceholder =
    tags.length > 0 || mealList || lowEffortOnly || includeIdeas ? '' : 'Search recipes…';

  const focusSearch = () => {
    inputRef.current?.focus();
    setPanelOpen(true);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.searchRow}>
        <div
          role="search"
          className={styles.searchField}
          onClick={focusSearch}
          aria-label="Search recipes"
        >
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.tagChip}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              aria-label={`Remove ${tag} filter`}
            >
              {tag}
              <span aria-hidden>×</span>
            </button>
          ))}
          {mealList ? (
            <button
              type="button"
              className={styles.tagChip}
              onClick={(e) => {
                e.stopPropagation();
                setMealList(undefined);
              }}
              aria-label={`Remove ${MEAL_LIST_LABELS[mealList]} filter`}
            >
              {MEAL_LIST_LABELS[mealList]}
              <span aria-hidden>×</span>
            </button>
          ) : null}
          {lowEffortOnly ? (
            <button
              type="button"
              className={styles.tagChip}
              onClick={(e) => {
                e.stopPropagation();
                setLowEffortOnly(false);
              }}
              aria-label="Remove Low effort filter"
            >
              Low effort
              <span aria-hidden>×</span>
            </button>
          ) : null}
          {includeIdeas ? (
            <button
              type="button"
              className={styles.tagChip}
              onClick={(e) => {
                e.stopPropagation();
                setIncludeIdeas(false);
              }}
              aria-label="Remove Quick ideas filter"
            >
              Quick ideas
              <span aria-hidden>×</span>
            </button>
          ) : null}
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setPanelOpen(true)}
            placeholder={searchPlaceholder}
            aria-label="Search text"
            aria-expanded={panelOpen}
            aria-controls={panelOpen ? panelId : undefined}
          />
        </div>
        {hasActiveFilters ? (
          <button type="button" className={styles.clear} onClick={clearFilters}>
            Clear
          </button>
        ) : null}
      </div>

      {panelOpen ? (
        <div id={panelId} className={styles.panel} role="region" aria-label="Recipe filters">
          <p className={styles.panelLabel}>Tags</p>
          <div className={styles.chips}>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={[styles.chip, tags.includes(tag) ? styles.chipActive : ''].join(' ')}
                onClick={() => toggleTag(tag)}
                aria-pressed={tags.includes(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {extraTags.length > 0 ? (
            <>
              <button
                type="button"
                className={styles.moreTags}
                onClick={() => setShowAllTags((open) => !open)}
                aria-expanded={showAllTags}
              >
                {showAllTags ? 'Fewer tags' : 'More tags'}
              </button>
              {showAllTags ? (
                <div className={styles.chips}>
                  {extraTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={[styles.chip, tags.includes(tag) ? styles.chipActive : ''].join(
                        ' ',
                      )}
                      onClick={() => toggleTag(tag)}
                      aria-pressed={tags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          <p className={styles.panelLabel}>Lists</p>
          <div className={styles.chips}>
            <button
              type="button"
              className={[styles.chip, !mealList ? styles.chipActive : ''].join(' ')}
              onClick={() => setMealList(undefined)}
              aria-pressed={!mealList}
            >
              All lists
            </button>
            {MEAL_LISTS.map((list) => (
              <button
                key={list}
                type="button"
                className={[styles.chip, mealList === list ? styles.chipActive : ''].join(' ')}
                onClick={() => setMealList(mealList === list ? undefined : list)}
                aria-pressed={mealList === list}
              >
                {MEAL_LIST_LABELS[list]}
              </button>
            ))}
          </div>

          <p className={styles.panelLabel}>Effort</p>
          <div className={styles.chips}>
            <button
              type="button"
              className={[styles.chip, lowEffortOnly ? styles.chipActive : ''].join(' ')}
              onClick={() => setLowEffortOnly(!lowEffortOnly)}
              aria-pressed={lowEffortOnly}
            >
              Low effort
            </button>
          </div>

          <p className={styles.panelLabel}>Catalog</p>
          <div className={styles.chips}>
            <button
              type="button"
              className={[styles.chip, includeIdeas ? styles.chipActive : ''].join(' ')}
              onClick={() => setIncludeIdeas(!includeIdeas)}
              aria-pressed={includeIdeas}
            >
              Quick ideas
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
