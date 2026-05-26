import type { MealType } from '@/static-api/mealTypes';
import type { FoodIdea } from '@/static-api/types/foodIdea';

export type FoodIdeaFilters = {
  query?: string;
  tags?: string[];
  mealType?: MealType;
};

function ideaHaystack(idea: FoodIdea): string {
  return [idea.title, idea.description ?? '', ...idea.tags].join(' ').toLowerCase();
}

export function filterFoodIdeas(ideas: FoodIdea[], filters: FoodIdeaFilters): FoodIdea[] {
  let list = ideas;
  const q = filters.query?.trim().toLowerCase();
  if (q) {
    list = list.filter((idea) => ideaHaystack(idea).includes(q));
  }
  const tagFilters = filters.tags ?? [];
  for (const tag of tagFilters) {
    list = list.filter((idea) => idea.tags.includes(tag));
  }
  if (filters.mealType) {
    list = list.filter((idea) => idea.mealTypes.includes(filters.mealType!));
  }
  return list.sort((a, b) => a.title.localeCompare(b.title));
}
