import catalogData from '../data/bento-ideas.json';
import type { BentoIdea, BentoIdeaCatalog } from '../types/bentoIdea';

let cache: BentoIdea[] | null = null;

/** Clears in-memory cache (for tests). */
export function resetBentoIdeasCatalogCache(): void {
  cache = null;
}

export async function loadBentoIdeasCatalog(): Promise<BentoIdea[]> {
  if (cache) return cache;
  const data = catalogData as BentoIdeaCatalog;
  if (!Array.isArray(data.ideas)) {
    throw new Error('Invalid bento ideas catalog: missing ideas array');
  }
  cache = data.ideas;
  return cache;
}
