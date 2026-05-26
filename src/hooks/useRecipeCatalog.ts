import { useEffect, useMemo, useState } from 'react';
import { getRecipes } from '@/static-api';
import type { Recipe } from '@/static-api/types/recipe';
import { useRecipeEdits } from '@/hooks/useRecipeEdits';

export function useRecipeCatalog() {
  const [catalogRecipes, setCatalogRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mergeCatalog } = useRecipeEdits();

  useEffect(() => {
    let cancelled = false;
    getRecipes()
      .then((data) => {
        if (!cancelled) setCatalogRecipes(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load recipes');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const recipes = useMemo(
    () => mergeCatalog(catalogRecipes),
    [catalogRecipes, mergeCatalog],
  );

  return { recipes, catalogRecipes, loading, error };
}
