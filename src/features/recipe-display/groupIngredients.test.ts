import { describe, expect, it } from 'vitest';
import { groupIngredients } from './groupIngredients';

describe('groupIngredients', () => {
  it('splits soup ingredients from garnishes', () => {
    const groups = groupIngredients([
      { amount: '1', unit: '', name: 'chicken' },
      { amount: '1', unit: '', name: 'onion' },
      { amount: '', unit: '', name: 'avocado', group: 'Garnishes' },
      { amount: '', unit: '', name: 'cilantro', group: 'Garnishes' },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe('');
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].label).toBe('Garnishes');
    expect(groups[1].items).toHaveLength(2);
  });
});
