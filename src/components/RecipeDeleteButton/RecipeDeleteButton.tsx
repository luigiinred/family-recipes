import type { ButtonHTMLAttributes } from 'react';
import styles from './RecipeDeleteButton.module.css';

type RecipeDeleteButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  title: string;
  onDelete: () => void;
};

export function RecipeDeleteButton({
  title,
  onDelete,
  className,
  ...rest
}: RecipeDeleteButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={`Delete ${title}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete();
      }}
      {...rest}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
