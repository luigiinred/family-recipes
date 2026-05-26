export type BentoSection = 'snack' | 'fruit' | 'veggie' | 'main' | 'treat';

export type BentoIdea = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  section: BentoSection;
  tips?: string;
  recipeSlug?: string;
  tags?: string[];
};

export type BentoIdeaCatalog = {
  ideas: BentoIdea[];
};

export const BENTO_SECTION_ORDER: BentoSection[] = [
  'snack',
  'fruit',
  'veggie',
  'main',
  'treat',
];

export const BENTO_SECTION_LABELS: Record<BentoSection, string> = {
  snack: 'Snack & crunch',
  fruit: 'Fruit',
  veggie: 'Veggie',
  main: 'Main',
  treat: 'Treat',
};
