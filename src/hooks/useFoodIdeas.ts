import { useEffect, useState } from 'react';
import { getFoodIdeas } from '@/static-api';
import type { FoodIdea } from '@/static-api/types/foodIdea';

export function useFoodIdeas() {
  const [ideas, setIdeas] = useState<FoodIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFoodIdeas()
      .then((data) => {
        if (!cancelled) setIdeas(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load food ideas');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ideas, loading, error };
}
