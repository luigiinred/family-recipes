import { describe, expect, it } from 'vitest';
import { inferMealTypes, recipeMatchesMealType, resolveMealTypes } from './mealTypes';

describe('inferMealTypes', () => {
  it('tags desserts', () => {
    expect(
      inferMealTypes({ title: 'Chocolate Lava Cake', tags: ['dessert'], description: '' }),
    ).toEqual(['dessert']);
  });

  it('tags breakfast dishes', () => {
    expect(
      inferMealTypes({ title: 'Blueberry Pancakes', tags: ['breakfast'], description: '' }),
    ).toEqual(['breakfast']);
  });

  it('defaults mains to lunch and dinner', () => {
    expect(
      inferMealTypes({ title: 'Sheet Pan Chicken', tags: ['chicken'], description: '' }),
    ).toEqual(['lunch', 'dinner']);
  });

  it('tags salads as sides with lunch', () => {
    const types = inferMealTypes({ title: 'Caesar Salad', tags: ['salad'], description: '' });
    expect(types).toContain('side');
    expect(types).toContain('lunch');
  });
});

describe('resolveMealTypes', () => {
  it('prefers explicit mealTypes on the recipe', () => {
    expect(
      resolveMealTypes({
        title: 'Mystery Dish',
        tags: [],
        mealTypes: ['snack'],
      }),
    ).toEqual(['snack']);
  });
});

describe('recipeMatchesMealType', () => {
  it('matches explicit meal types', () => {
    expect(
      recipeMatchesMealType(
        { title: 'Trail Mix', tags: [], mealTypes: ['snack', 'dessert'] },
        'snack',
      ),
    ).toBe(true);
  });
});
