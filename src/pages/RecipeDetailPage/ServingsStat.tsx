import { useEffect, useId, useRef, useState } from 'react';
import styles from './RecipeDetailPage.module.css';

type ServingsStatProps = {
  servings: number;
  onChange: (servings: number) => void;
};

export function ServingsStat({ servings, onChange }: ServingsStatProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const label = servings === 1 ? 'serving' : 'servings';

  if (editing) {
    return (
      <div className={styles.statRow}>
        <span className={styles.statIcon} aria-hidden>
          🍽
        </span>
        <label htmlFor={inputId} className={styles.servingsEditLabel}>
          Servings
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="number"
          min={1}
          max={24}
          value={servings}
          className={styles.servingsInputInline}
          onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              setEditing(false);
            }
          }}
        />
        <span className={styles.servingsUnit}>{label}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.statButton}
      onClick={() => setEditing(true)}
      aria-label={`${servings} ${label}, click to adjust`}
    >
      <span className={styles.statIcon} aria-hidden>
        🍽
      </span>
      <span>
        {servings} {label}
      </span>
    </button>
  );
}
