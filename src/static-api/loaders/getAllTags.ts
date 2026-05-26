import { loadFoodIdeasCatalog } from './loadFoodIdeasCatalog';
import { loadRecipeCatalog } from './loadRecipeCatalog';

export async function getAllTags(): Promise<string[]> {
  const [recipes, ideas] = await Promise.all([
    loadRecipeCatalog(),
    loadFoodIdeasCatalog(),
  ]);
  const tagSet = new Set<string>();
  for (const recipe of recipes) {
    for (const tag of recipe.tags) {
      tagSet.add(tag);
    }
  }
  for (const idea of ideas) {
    for (const tag of idea.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort((a, b) => a.localeCompare(b));
}
