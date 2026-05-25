import { describe, expect, it } from 'vitest';
import { scaleIngredient } from './scaleIngredient';

describe('scaleIngredient', () => {
  it('multiplies numeric amounts', () => {
    expect(scaleIngredient({ amount: '2', unit: 'cups', name: 'flour' }, 2)).toEqual({
      amount: '4',
      unit: 'cups',
      name: 'flour',
    });
  });

  it('leaves non-numeric amounts unchanged', () => {
    expect(scaleIngredient({ amount: 'pinch', unit: '', name: 'salt' }, 2)).toEqual({
      amount: 'pinch',
      unit: '',
      name: 'salt',
    });
  });
});
