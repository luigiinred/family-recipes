import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecipeFilters } from './RecipeFilterContext';

/** Legacy `/tags/:tag` URLs → home with that tag in nav search filters. */
export function TagFilterRedirect() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { addTag } = useRecipeFilters();

  useEffect(() => {
    if (tag) {
      addTag(decodeURIComponent(tag));
    }
    navigate('/', { replace: true });
  }, [tag, addTag, navigate]);

  return null;
}
