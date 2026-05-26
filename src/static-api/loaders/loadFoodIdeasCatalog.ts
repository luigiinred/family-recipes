import catalogData from '../data/food-ideas.json';
import type { FoodIdea, FoodIdeaCatalog } from '../types/foodIdea';

let cache: FoodIdea[] | null = null;

/** Clears in-memory cache (for tests). */
export function resetFoodIdeasCatalogCache(): void {
  cache = null;
}

export async function loadFoodIdeasCatalog(): Promise<FoodIdea[]> {
  if (cache) return cache;
  const data = catalogData as FoodIdeaCatalog;
  if (!Array.isArray(data.ideas)) {
    throw new Error('Invalid food ideas catalog: missing ideas array');
  }
  cache = data.ideas;
  return cache;
}
