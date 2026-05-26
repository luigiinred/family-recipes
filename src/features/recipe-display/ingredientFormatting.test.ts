import { describe, expect, it } from 'vitest';
import {
  formatIngredientLine,
  formatIngredientName,
  formatIngredientUnit,
} from './ingredientFormatting';

describe('formatIngredientUnit', () => {
  it('canonicalizes tablespoon and teaspoon', () => {
    expect(formatIngredientUnit('tbsp')).toBe('Tbsp');
    expect(formatIngredientUnit('TBSP')).toBe('Tbsp');
    expect(formatIngredientUnit('tsp')).toBe('tsp');
  });
});

describe('formatIngredientName', () => {
  it('lowercases food names and prep notes', () => {
    expect(formatIngredientName('Olive Oil')).toBe('olive oil');
    expect(formatIngredientName('Poblano Pepper, Medium Diced')).toBe(
      'poblano pepper, medium diced',
    );
  });
});

describe('formatIngredientLine', () => {
  it('renders consistent casing in the list', () => {
    expect(
      formatIngredientLine({ amount: '2', unit: 'Tbsp', name: 'olive oil' }),
    ).toBe('2 Tbsp olive oil');
    expect(
      formatIngredientLine({ amount: '1', unit: 'tsp', name: 'paprika' }),
    ).toBe('1 tsp paprika');
  });
});
