import { loadFoodIdeasCatalog } from './loadFoodIdeasCatalog';

export async function getFoodIdeas() {
  return loadFoodIdeasCatalog();
}
