export type IngredientFields = {
  amount: string;
  unit: string;
  name: string;
  group?: string;
};

/**
 * Canonical measure units stored in catalog JSON and shown in the UI.
 * Always use these exact strings — never `tablespoon`, `TBSP`, `cups`, etc.
 */
export const MEASURE_UNITS = [
  'tsp',
  'Tbsp',
  'cup',
  'L',
  'ml',
  'oz',
  'lb',
  'g',
  'kg',
  'can',
  'clove',
  'cloves',
  'pinch',
] as const;

export type MeasureUnit = (typeof MEASURE_UNITS)[number];

/** Empty string = count-only lines (`1 red onion`). */
export type IngredientUnit = MeasureUnit | '';

/** Lowercase alias → canonical `MeasureUnit`. */
export const UNIT_ALIASES: Record<string, MeasureUnit> = {
  tsp: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  tbsp: 'Tbsp',
  tablespoon: 'Tbsp',
  tablespoons: 'Tbsp',
  cup: 'cup',
  cups: 'cup',
  l: 'L',
  liter: 'L',
  liters: 'L',
  litre: 'L',
  litres: 'L',
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  can: 'can',
  cans: 'can',
  clove: 'clove',
  cloves: 'cloves',
  pinch: 'pinch',
};

const MEASURE_UNIT_SET = new Set<string>(MEASURE_UNITS);

/** `(28 oz) can` — size is part of the unit, not the name. */
const LITERAL_CAN_UNIT = /^\(\d+(?:\.\d+)?\s*(?:oz|lb)\.?\)\s+can$/i;

export function isMeasureUnit(unit: string): unit is MeasureUnit {
  return MEASURE_UNIT_SET.has(unit);
}

export function isLiteralCanUnit(unit: string): boolean {
  return LITERAL_CAN_UNIT.test(unit.trim());
}

/**
 * Normalize any unit string to a catalog-safe value.
 * Known measures → canonical enum; `(N oz) can` → preserved; unknown → ``.
 */
export function normalizeIngredientUnit(unit: string): IngredientUnit {
  const trimmed = unit.trim();
  if (!trimmed) return '';

  if (isMeasureUnit(trimmed)) return trimmed;

  const key = trimmed.replace(/\s+/g, ' ').toLowerCase();
  if (UNIT_ALIASES[key]) return UNIT_ALIASES[key];

  if (isLiteralCanUnit(trimmed)) {
    return trimmed.replace(/\s+/g, ' ').replace(/\.(\s*)can/i, ' can') as IngredientUnit;
  }

  return '';
}

/**
 * Display-safe unit (aliases → canonical). Unknown legacy values pass through unchanged.
 */
export function formatIngredientUnit(unit: string): string {
  const normalized = normalizeIngredientUnit(unit);
  if (normalized) return normalized;
  const trimmed = unit.trim();
  if (!trimmed) return '';
  if (isLiteralCanUnit(trimmed)) return trimmed.replace(/\s+/g, ' ');
  return trimmed;
}

/** Ingredient names: lowercase food nouns; prep after commas stays lowercase. */
export function formatIngredientName(name: string): string {
  return name
    .trim()
    .split(', ')
    .map((part) => part.toLowerCase())
    .join(', ');
}

export type IngredientDisplayParts = {
  amount: string;
  unit: string;
  name: string;
  /** Plain-text line: `2 Tbsp olive oil` */
  line: string;
};

/** Structured parts for rendering amount · unit · name consistently. */
export function getIngredientDisplayParts(ing: IngredientFields): IngredientDisplayParts {
  const amount = ing.amount.trim();
  const unit = formatIngredientUnit(ing.unit);
  const name = formatIngredientName(ing.name);
  const line = [amount, unit, name].filter(Boolean).join(' ');
  return { amount, unit, name, line };
}

export function formatIngredientLine(ing: IngredientFields): string {
  return getIngredientDisplayParts(ing).line;
}

export function formatIngredientForCatalog<T extends IngredientFields>(ing: T): T {
  return {
    ...ing,
    unit: formatIngredientUnit(ing.unit),
    name: formatIngredientName(ing.name),
  };
}
