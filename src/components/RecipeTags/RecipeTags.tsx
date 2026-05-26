import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { TagFilterButton } from '@/components/TagFilterButton/TagFilterButton';
import { filterTagSuggestions } from '@/features/recipe-tags/filterTagSuggestions';
import { normalizeTag } from '@/lib/normalizeTag';
import styles from './RecipeTags.module.css';

type RecipeTagsProps = {
  tags: string[];
  allTags: string[];
  onTagsChange: (tags: string[]) => void;
};

export function RecipeTags({ tags, allTags, onTagsChange }: RecipeTagsProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const normalizedQuery = normalizeTag(query);
  const suggestions = useMemo(
    () => filterTagSuggestions(allTags, normalizedQuery, tags),
    [allTags, normalizedQuery, tags],
  );
  const canCreate =
    normalizedQuery.length > 0 &&
    !tags.includes(normalizedQuery) &&
    !suggestions.includes(normalizedQuery);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const addTag = (tag: string) => {
    const normalized = normalizeTag(tag);
    if (!normalized || tags.includes(normalized)) {
      close();
      return;
    }
    onTagsChange([...tags, normalized].sort((a, b) => a.localeCompare(b)));
    close();
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
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
    <div className={styles.root}>
      <ul className={styles.tagList} aria-label="Tags">
        {tags.map((tag) => (
          <li key={tag} className={styles.tagItem}>
            <TagFilterButton tag={tag} className={styles.tagLink} />
            <button
              type="button"
              className={styles.removeTag}
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(tag)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.addWrap} ref={wrapRef}>
        <button
          type="button"
          className={styles.addButton}
          aria-label="Add tag"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => (open ? close() : setOpen(true))}
        >
          +
        </button>

        {open ? (
          <div className={styles.popover}>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-label="Tag name"
              aria-expanded
              aria-controls={listboxId}
              aria-autocomplete="list"
              className={styles.input}
              placeholder="Search or create…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  close();
                  return;
                }
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (canCreate) {
                    addTag(normalizedQuery);
                  } else if (suggestions[0]) {
                    addTag(suggestions[0]);
                  }
                }
              }}
            />
            <p className={styles.hint}>Pick an existing tag or create a new one.</p>

            {suggestions.length > 0 || canCreate ? (
              <ul id={listboxId} className={styles.suggestions} role="listbox" aria-label="Tag suggestions">
                {suggestions.map((tag) => (
                  <li key={tag} role="presentation">
                    <button
                      type="button"
                      role="option"
                      className={styles.suggestion}
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </button>
                  </li>
                ))}
                {canCreate ? (
                  <li role="presentation">
                    <button
                      type="button"
                      role="option"
                      className={styles.createOption}
                      aria-label={`Create tag ${normalizedQuery}`}
                      onClick={() => addTag(normalizedQuery)}
                    >
                      <span className={styles.createLabel}>New tag</span>
                      <span className={styles.createName}>{normalizedQuery}</span>
                    </button>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className={styles.emptyHint}>Type a name for your new tag.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
