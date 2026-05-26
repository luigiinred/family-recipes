import { describe, expect, it } from 'vitest';
import {
  buildIngredientMatches,
  isSeasoningOnlyMention,
  segmentInstructionWithIngredients,
} from './stepIngredientLinks';
import type { Ingredient } from '@/static-api/types/recipe';

const stock: Ingredient = { amount: '1/4', unit: 'cup', name: 'chicken stock' };
const shrimp: Ingredient = {
  amount: '1/2',
  unit: 'lb',
  name: 'extra-large shrimp, peeled and deveined',
};
const garlic: Ingredient = { amount: '1', unit: 'cloves', name: 'garlic, minced' };

describe('isSeasoningOnlyMention', () => {
  it('treats salt and table pepper as non-ingredients', () => {
    expect(isSeasoningOnlyMention('salt')).toBe(true);
    expect(isSeasoningOnlyMention('black pepper')).toBe(true);
  });

  it('keeps chili and bell peppers linkable', () => {
    expect(isSeasoningOnlyMention('bell pepper')).toBe(false);
    expect(isSeasoningOnlyMention('cayenne')).toBe(false);
  });
});

describe('segmentInstructionWithIngredients', () => {
  it('bold-target spans for catalog ingredients in prose', () => {
    const segments = segmentInstructionWithIngredients(
      'Stir in chicken stock, hot sauce, and lemon juice to deglaze.',
      [stock, { amount: '1', unit: 'tsp', name: 'hot sauce of your choice' }],
    );
    const linked = segments.filter((s) => s.type === 'ingredient');
    expect(linked.some((s) => s.value.toLowerCase() === 'chicken stock')).toBe(true);
  });

  it('does not link salt mentions', () => {
    const segments = segmentInstructionWithIngredients(
      'Season shrimp with salt, pepper, and onion powder.',
      [shrimp, { amount: '1/2', unit: 'tsp', name: 'onion powder' }],
    );
    const linked = segments
      .filter((s) => s.type === 'ingredient')
      .map((s) => s.value.toLowerCase());
    expect(linked).not.toContain('salt');
    expect(linked).not.toContain('pepper');
    expect(linked.some((v) => v.includes('onion'))).toBe(true);
  });
});

describe('buildIngredientMatches', () => {
  it('prefers longer phrases', () => {
    const matches = buildIngredientMatches([stock, garlic]);
    const phrases = matches.map((m) => m.phrase);
    expect(phrases.indexOf('chicken stock')).toBeLessThan(phrases.indexOf('garlic'));
  });
});
