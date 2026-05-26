import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecipeFilters } from '@/features/search/RecipeFilterContext';
import styles from './TagFilterButton.module.css';

type TagFilterButtonProps = {
  tag: string;
  className?: string;
};

export function TagFilterButton({ tag, className }: TagFilterButtonProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { addTag } = useRecipeFilters();

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      addTag(tag);
      if (pathname !== '/') {
        navigate('/');
      }
    },
    [addTag, navigate, pathname, tag],
  );

  const classes = className ?? styles.button;

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={`Filter by ${tag}`}
    >
      {tag}
    </button>
  );
}
