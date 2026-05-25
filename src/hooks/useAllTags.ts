import { useEffect, useState } from 'react';
import { getAllTags } from '@/static-api';

export function useAllTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    getAllTags().then(setTags);
  }, []);

  return tags;
}
