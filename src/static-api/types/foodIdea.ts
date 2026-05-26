import type { MealType } from '../mealTypes';

export type IdeaKind = 'takeout' | 'pantry' | 'leftovers' | 'kid' | 'other';

export type FoodIdea = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tags: string[];
  mealTypes: MealType[];
  ideaKind?: IdeaKind;
};

export type FoodIdeaCatalog = {
  ideas: FoodIdea[];
};

export const IDEA_KIND_LABELS: Record<IdeaKind, string> = {
  takeout: 'Takeout',
  pantry: 'Pantry',
  leftovers: 'Leftovers',
  kid: 'Kid',
  other: 'Quick bite',
};
