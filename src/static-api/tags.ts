/** Curated quick filters on the home page (order matters). */
export const QUICK_TAGS = [
  'vegetarian',
  'slow-cooker',
  'chicken',
  'soup',
  'keto',
  'low-carb',
  'family',
  'greek',
  'mexican',
] as const;

export type QuickTag = (typeof QUICK_TAGS)[number];
