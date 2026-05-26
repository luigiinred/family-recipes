import { useEffect, useState } from 'react';
import { getBentoIdeas } from '@/static-api/loaders/getBentoIdeas';
import type { BentoIdea } from '@/static-api/types/bentoIdea';

export function useBentoIdeas() {
  const [ideas, setIdeas] = useState<BentoIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBentoIdeas()
      .then((data) => {
        if (!cancelled) {
          setIdeas(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load bento ideas');
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
