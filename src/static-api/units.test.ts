import { describe, expect, it } from 'vitest';
import {
  formatIngredientLine,
  formatIngredientUnit,
  getIngredientDisplayParts,
  normalizeIngredientUnit,
} from './units';

describe('normalizeIngredientUnit', () => {
  it('maps aliases to canonical measure units', () => {
    expect(normalizeIngredientUnit('tablespoons')).toBe('Tbsp');
    expect(normalizeIngredientUnit('cups')).toBe('cup');
    expect(normalizeIngredientUnit('TSP')).toBe('tsp');
  });

  it('preserves literal can sizes', () => {
    expect(normalizeIngredientUnit('(28 oz) can')).toBe('(28 oz) can');
  });

  it('returns empty for missing unit', () => {
    expect(normalizeIngredientUnit('')).toBe('');
  });
});

describe('formatIngredientUnit', () => {
  it('keeps Tbsp and tsp casing distinct', () => {
    expect(formatIngredientUnit('tbsp')).toBe('Tbsp');
    expect(formatIngredientUnit('tsp')).toBe('tsp');
  });
});

describe('getIngredientDisplayParts', () => {
  it('builds a consistent line', () => {
    expect(
      getIngredientDisplayParts({
        amount: '2',
        unit: 'Tbsp',
        name: 'olive oil',
      }),
    ).toEqual({
      amount: '2',
      unit: 'Tbsp',
      name: 'olive oil',
      line: '2 Tbsp olive oil',
    });
  });
});

describe('formatIngredientLine', () => {
  it('matches display parts line', () => {
    const ing = { amount: '1', unit: 'tsp', name: 'paprika' };
    expect(formatIngredientLine(ing)).toBe('1 tsp paprika');
  });
});
