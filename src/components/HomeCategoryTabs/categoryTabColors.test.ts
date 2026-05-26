import { describe, expect, it } from 'vitest';
import { getCategoryTabColorVar } from './categoryTabColors';

describe('getCategoryTabColorVar', () => {
  it('maps default meal-type category ids to palette tokens', () => {
    expect(
      getCategoryTabColorVar({ id: 'dinner', filters: { mealType: 'dinner' } }),
    ).toBe('--color-category-dinner');
    expect(
      getCategoryTabColorVar({ id: 'lunch', filters: { mealType: 'lunch' } }),
    ).toBe('--color-category-lunch');
    expect(
      getCategoryTabColorVar({ id: 'dessert', filters: { mealType: 'dessert' } }),
    ).toBe('--color-category-dessert');
    expect(
      getCategoryTabColorVar({ id: 'snacks', filters: { mealType: 'snack' } }),
    ).toBe('--color-category-snack');
  });

  it('falls back to meal type when id is custom', () => {
    expect(
      getCategoryTabColorVar({
        id: 'cat-custom',
        filters: { mealType: 'dessert' },
      }),
    ).toBe('--color-category-dessert');
  });

  it('uses default token for unknown categories', () => {
    expect(getCategoryTabColorVar({ id: 'cat-custom', filters: {} })).toBe(
      '--color-category-default',
    );
  });
});
