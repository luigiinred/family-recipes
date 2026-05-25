import { loadRecipeCatalog } from './loadRecipeCatalog';

export async function getAllTags(): Promise<string[]> {
  const recipes = await loadRecipeCatalog();
  const tagSet = new Set<string>();
  for (const recipe of recipes) {
    for (const tag of recipe.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort((a, b) => a.localeCompare(b));
}
