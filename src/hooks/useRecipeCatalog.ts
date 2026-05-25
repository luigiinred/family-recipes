import { useEffect, useState } from 'react';
import { getRecipes } from '@/static-api';
import type { Recipe } from '@/static-api/types/recipe';

export function useRecipeCatalog() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRecipes()
      .then((data) => {
        if (!cancelled) setRecipes(data);
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

  return { recipes, loading, error };
}
