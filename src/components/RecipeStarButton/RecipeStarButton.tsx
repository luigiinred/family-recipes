import type { ButtonHTMLAttributes } from 'react';
import styles from './RecipeStarButton.module.css';

type RecipeStarButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  title: string;
  starred: boolean;
  onToggle: () => void;
};

export function RecipeStarButton({
  title,
  starred,
  onToggle,
  className,
  ...rest
}: RecipeStarButtonProps) {
  const label = starred ? `Remove ${title} from starred` : `Star ${title}`;
  const classes = [styles.button, starred ? styles.starred : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={label}
      aria-pressed={starred}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      {...rest}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill={starred ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    </button>
  );
}
