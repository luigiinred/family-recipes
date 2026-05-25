import { useId } from 'react';
import styles from './TagFilter.module.css';

type TagFilterProps = {
  tags: string[];
  value: string;
  onChange: (value: string) => void;
};

export function TagFilter({ tags, value, onChange }: TagFilterProps) {
  const listId = useId();

  return (
    <div className={styles.wrap}>
      <label htmlFor="tag-filter-input" className={styles.label}>
        Filter by tag
      </label>
      <input
        id="tag-filter-input"
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={listId}
        placeholder="Type or pick a tag…"
        aria-describedby="tag-filter-hint"
      />
      <datalist id={listId}>
        {tags.map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>
      <p id="tag-filter-hint" className={styles.hint}>
        Pick from suggestions or type any tag used on your recipes.
      </p>
    </div>
  );
}
