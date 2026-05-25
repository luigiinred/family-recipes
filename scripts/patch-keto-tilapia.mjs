#!/usr/bin/env node
/** Manual enrichment when ketofy.me redirects and ketopots blocks fetch. */
import { patchRecipe } from './lib/patch-recipe.mjs';

patchRecipe('keto-fried-tilapia-lemon-garlic-butter', {
  sourceUrl: 'https://ketopots.com/keto-tilapia/',
  notes:
    'Original bookmark: ketofy.me (redirects). Data from ketopots.com via browser/WebFetch.',
  imageUrl: 'https://ketopots.com/wp-content/uploads/2021/05/Keto-Tilapia-Recipe.jpg',
  prepMinutes: 15,
  cookMinutes: 20,
  servings: 4,
  ingredients: [
    { amount: '4', unit: '', name: 'tilapia filets, 4 oz each' },
    { amount: '2', unit: '', name: 'eggs' },
    { amount: '1/2', unit: 'cup', name: 'crushed pork rinds' },
    { amount: '1/4', unit: 'cup', name: 'finely grated fresh Parmesan cheese' },
    { amount: '', unit: '', name: 'oil for frying' },
    { amount: '1/4', unit: 'cup', name: 'butter' },
    { amount: '2', unit: 'tbsp', name: 'lemon juice' },
    { amount: '1/2', unit: 'tsp', name: 'lemon zest' },
    { amount: '2', unit: 'cloves', name: 'garlic, minced' },
    { amount: '1', unit: 'tbsp', name: 'capers, rinsed and chopped' },
  ],
  steps: [
    'Melt 1 tablespoon butter; cook garlic 30 seconds. Off heat, add lemon juice, zest, capers; season. Set sauce aside.',
    'Season tilapia with salt and pepper. Whisk eggs in a shallow dish.',
    'Combine Parmesan and pork rinds on a plate. Dip fish in egg, then dredge in cheese mixture.',
    'Heat 1/2 inch oil in a skillet over medium-high. Fry fish in batches until golden brown.',
    'Serve with lemon caper sauce.',
  ],
});

console.log('Patched keto-fried-tilapia-lemon-garlic-butter');
