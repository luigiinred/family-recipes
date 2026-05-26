import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { filterRecipePairSuggestions } from '@/features/recipe-edits/filterRecipePairSuggestions';
import type { Recipe } from '@/static-api/types/recipe';
import styles from './RelatedRecipes.module.css';

type RelatedRecipesProps = {
  recipes: Recipe[];
  editorMode?: boolean;
  currentSlug?: string;
  allRecipes?: Recipe[];
  onPairedChange?: (slugs: string[]) => void;
};

export function RelatedRecipes({
  recipes,
  editorMode = false,
  currentSlug = '',
  allRecipes = [],
  onPairedChange,
}: RelatedRecipesProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const pairedSlugs = useMemo(() => recipes.map((recipe) => recipe.slug), [recipes]);

  const suggestions = useMemo(
    () =>
      filterRecipePairSuggestions(allRecipes, {
        query,
        currentSlug,
        pairedSlugs,
      }),
    [allRecipes, query, currentSlug, pairedSlugs],
  );

  const canEdit = editorMode && Boolean(onPairedChange) && Boolean(currentSlug);

  if (!editorMode && recipes.length === 0) return null;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const addRecipe = (recipe: Recipe) => {
    if (!onPairedChange || pairedSlugs.includes(recipe.slug)) {
      close();
      return;
    }
    onPairedChange([...pairedSlugs, recipe.slug]);
    close();
  };

  const removeRecipe = (slug: string) => {
    onPairedChange?.(pairedSlugs.filter((pairedSlug) => pairedSlug !== slug));
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <nav className={styles.root} aria-label="Related recipes">
      <h3 className={styles.heading}>Related recipes</h3>
      {recipes.length > 0 ? (
        <ul className={styles.list}>
          {recipes.map((related) => (
            <li key={related.slug} className={styles.listItem}>
              <Link to={`/recipes/${related.slug}`} className={styles.link}>
                {related.title}
              </Link>
              {canEdit ? (
                <button
                  type="button"
                  className={styles.removeLink}
                  aria-label={`Remove link to ${related.title}`}
                  onClick={() => removeRecipe(related.slug)}
                >
                  ×
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {canEdit ? (
        <div className={styles.addWrap} ref={wrapRef}>
          <button
            type="button"
            className={styles.addButton}
            aria-label="Add linked recipe"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => (open ? close() : setOpen(true))}
          >
            + Link recipe
          </button>

          {open ? (
            <div className={styles.popover}>
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-label="Search recipes"
                aria-expanded
                aria-controls={listboxId}
                aria-autocomplete="list"
                className={styles.input}
                placeholder="Search recipes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    close();
                    return;
                  }
                  if (e.key === 'Enter' && suggestions[0]) {
                    e.preventDefault();
                    addRecipe(suggestions[0]);
                  }
                }}
              />
              <p className={styles.hint}>Search by recipe name.</p>

              {suggestions.length > 0 ? (
                <ul id={listboxId} className={styles.suggestions} role="listbox" aria-label="Recipe suggestions">
                  {suggestions.map((recipe) => (
                    <li key={recipe.slug} role="presentation">
                      <button
                        type="button"
                        role="option"
                        className={styles.suggestion}
                        onClick={() => addRecipe(recipe)}
                      >
                        {recipe.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyHint}>
                  {query.trim() ? 'No matching recipes.' : 'Type to search the catalog.'}
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
