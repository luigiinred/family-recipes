import { loadBentoIdeasCatalog } from './loadBentoIdeasCatalog';

export async function getBentoIdeas() {
  return loadBentoIdeasCatalog();
}
