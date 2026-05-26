import { loadFoodIdeasCatalog } from './loadFoodIdeasCatalog';
import type { FoodIdea } from '../types/foodIdea';

export async function getFoodIdeaBySlug(slug: string): Promise<FoodIdea | undefined> {
  const ideas = await loadFoodIdeasCatalog();
  return ideas.find((idea) => idea.slug === slug);
}
