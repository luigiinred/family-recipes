import { describe, expect, it } from 'vitest';
import { simplifyRecipeTitle } from './simplify-recipe-title.mjs';

describe('simplifyRecipeTitle', () => {
  it('shortens noisy YouTube titles', () => {
    expect(
      simplifyRecipeTitle(
        '25 MIN CHICKEN TORTILLA SOUP (So Much Better When You Treat it Like CHILI) | Weeknighting',
      ),
    ).toBe('Chicken Tortilla Soup');
  });

  it('strips channel pipe suffixes', () => {
    expect(
      simplifyRecipeTitle('Gigantes Plaki | Greek Baked Beans Recipe | The Mediterranean Dish'),
    ).toBe('Gigantes Plaki');
  });

  it('leaves already-short titles alone', () => {
    expect(simplifyRecipeTitle('Chicken Tortilla Soup')).toBe('Chicken Tortilla Soup');
  });

  it('handles empty input', () => {
    expect(simplifyRecipeTitle('')).toBe('Untitled Recipe');
  });
});
