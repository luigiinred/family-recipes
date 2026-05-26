import { describe, expect, it } from 'vitest';
import {
  cleanIngredientNameFields,
  fixBrokenAmount,
  inferIngredientGroups,
  isImplicitSaltPepper,
  normalizeCatalogIngredients,
  repairIngredientFields,
} from './ingredient-lines.mjs';

describe('fixBrokenAmount', () => {
  it('prefixes lone slash fractions with 1', () => {
    expect(fixBrokenAmount('/2')).toBe('1/2');
    expect(fixBrokenAmount('/4')).toBe('1/4');
    expect(fixBrokenAmount('1/2')).toBe('1/2');
  });
});

describe('repairIngredientFields', () => {
  it('moves measure words from unit into amount when amount is missing', () => {
    expect(
      repairIngredientFields({ amount: '', unit: 'tablespoon', name: 'honey' }),
    ).toEqual({ amount: '1', unit: 'Tbsp', name: 'honey' });
  });

  it('fixes slash-only amounts', () => {
    expect(
      repairIngredientFields({ amount: '/2', unit: 'teaspoon', name: 'chili powder' }),
    ).toEqual({ amount: '1/2', unit: 'tsp', name: 'chili powder' });
  });

  it('reparses protein lines where the fish name landed in unit', () => {
    const fixed = repairIngredientFields({
      amount: '',
      unit: 'tilapia',
      name: 'fillets (or any white fish, wild-caught if possible)',
    });
    expect(fixed.unit).toBe('');
    expect(fixed.name).toMatch(/tilapia/);
  });
});

describe('normalizeCatalogIngredients — air fried tilapia', () => {
  const tilapiaRaw = [
    { amount: '', unit: 'tilapia', name: 'fillets (or any white fish)' },
    { amount: '', unit: 'large', name: 'sweet potato, cut into fries' },
    { amount: '', unit: 'broccoli', name: 'head, cut into florets' },
    { amount: '/2', unit: 'cup', name: 'freshly squeezed lime juice' },
    { amount: '/4', unit: 'cup', name: 'fresh chopped cilantro' },
    { amount: '', unit: 'tablespoons', name: 'olive oil + 2 for veggies' },
    { amount: '', unit: 'tablespoons', name: 'water' },
    { amount: '', unit: 'tablespoon', name: 'honey' },
    { amount: '', unit: 'tablespoon', name: 'minced garlic' },
    { amount: '', unit: 'teaspoon', name: 'red chili flakes' },
    { amount: '/2', unit: 'teaspoon', name: 'chili powder' },
    { amount: '/8', unit: 'teaspoon', name: 'ground cumin' },
    { amount: '', unit: 'Salt', name: 'and fresh cracked pepper' },
    { amount: '', unit: 'tablespoons', name: 'chopped cilantro leaves, for garnish' },
    { amount: '', unit: 'small', name: 'bird-eye pepper, sliced for garnish' },
  ];
  const steps = [
    'Whisk together 2 tablespoons olive oil, water, garlic, lime juice, honey, chili flakes, chili powder, cumin and cilantro in a small bowl.',
    'Place sweet potato fries and broccoli on the sheet. Stir in 2 tablespoons olive oil; season with salt and pepper.',
  ];

  it('repairs amounts and units', () => {
    const out = normalizeCatalogIngredients(tilapiaRaw, {
      title: 'Air Fried Veggies and Tilapia',
      steps,
    });
    const chili = out.find((i) => i.name.includes('chili powder'));
    expect(chili?.amount).toBe('1/2');
    expect(chili?.unit).toBe('tsp');
    const honey = out.find((i) => i.name === 'honey');
    expect(honey?.amount).toBe('1');
    expect(honey?.unit).toBe('Tbsp');
  });

  it('groups sauce whisk ingredients and garnishes', () => {
    const out = normalizeCatalogIngredients(tilapiaRaw, {
      title: 'Air Fried Veggies and Tilapia',
      steps,
    });
    const sauce = out.filter((i) => i.group === 'Chili-lime sauce');
    expect(sauce.length).toBeGreaterThanOrEqual(4);
    expect(sauce.some((i) => i.name.includes('honey'))).toBe(true);
    const garnishes = out.filter((i) => i.group === 'Garnishes');
    expect(garnishes.length).toBeGreaterThanOrEqual(2);
  });
});

describe('isImplicitSaltPepper', () => {
  it('drops salt and table pepper lines but keeps chili peppers', () => {
    expect(isImplicitSaltPepper('kosher salt and freshly ground black pepper, to taste')).toBe(
      true,
    );
    expect(isImplicitSaltPepper('salt to taste')).toBe(true);
    expect(isImplicitSaltPepper('crushed red chili pepper flakes, optional')).toBe(false);
    expect(isImplicitSaltPepper('bird-eye pepper, sliced for garnish')).toBe(false);
  });
});

describe('cleanIngredientNameFields', () => {
  it('strips duplicate metric when US amount is set', () => {
    expect(
      cleanIngredientNameFields({
        amount: '1/4',
        unit: 'cup',
        name: '(60ml) chicken stock',
      }),
    ).toEqual({ amount: '1/4', unit: 'cup', name: 'chicken stock' });
  });

  it('strips trailing grams when lb is the stored unit', () => {
    expect(
      cleanIngredientNameFields({
        amount: '1/2',
        unit: 'lb',
        name: '(700g) extra-large shrimp, peeled and deveined',
      }),
    ).toEqual({
      amount: '1/2',
      unit: 'lb',
      name: 'extra-large shrimp, peeled and deveined',
    });
  });
});

describe('inferIngredientGroups', () => {
  it('labels garnish lines', () => {
    const out = inferIngredientGroups(
      [{ amount: '', unit: '', name: 'cilantro, for garnish' }],
      [],
    );
    expect(out[0].group).toBe('Garnishes');
  });
});
