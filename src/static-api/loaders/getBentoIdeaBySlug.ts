import { loadBentoIdeasCatalog } from './loadBentoIdeasCatalog';

export async function getBentoIdeaBySlug(slug: string) {
  const ideas = await loadBentoIdeasCatalog();
  return ideas.find((idea) => idea.slug === slug);
}
