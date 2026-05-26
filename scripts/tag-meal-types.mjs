#!/usr/bin/env node
/**
 * Adds `mealTypes` to every recipe in the catalog using the same heuristics as
 * src/static-api/mealTypes.ts (kept in sync manually).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'src/static-api/data/recipes.json');

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'side', 'snack', 'dessert'];

const DESSERT =
  /\b(dessert|cake|cookie|brownie|pudding|pie|tart|muffin|cupcake|ice cream|sorbet|fudge|trifle|cheesecake|crumble|cobbler)\b/i;
const BREAKFAST =
  /\b(breakfast|brunch|pancake|waffle|oatmeal|granola|french toast|omelette|omelet|scramble|frittata|overnight oats|egg bake|shakshuka)\b/i;
const SNACK =
  /\b(snack|appetizer|appetiser|bite|bites|dip|chips|popcorn|trail mix|energy ball)\b/i;
const SIDE =
  /\b(side|salad|slaw|coleslaw|bread|roll|biscuit|cornbread|rice\b|orzo salad|tabbouleh|hummus|dip)\b/i;
const LUNCH =
  /\b(lunch|sandwich|wrap|quesadilla|taco|burrito|bowl|soup|chili|stew|salad)\b/i;

function unique(types) {
  return [...new Set(types)];
}

function inferMealTypes(recipe) {
  const haystack = `${recipe.title} ${(recipe.tags ?? []).join(' ')} ${recipe.description ?? ''}`;

  if (DESSERT.test(haystack)) return ['dessert'];
  if (BREAKFAST.test(haystack)) return ['breakfast'];
  if (SNACK.test(haystack)) return ['snack'];

  const types = [];
  if (SIDE.test(haystack) && !/\b(main|entree|entrée|dinner)\b/i.test(haystack)) {
    types.push('side');
  }
  if (LUNCH.test(haystack)) types.push('lunch');

  if (types.length === 0) return ['lunch', 'dinner'];
  if (!types.includes('dinner') && !types.includes('lunch')) {
    types.push('lunch', 'dinner');
  } else if (!types.includes('dinner')) {
    types.push('dinner');
  }
  return unique(types);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
let updated = 0;

for (const recipe of catalog.recipes) {
  const next = inferMealTypes(recipe);
  const prev = recipe.mealTypes;
  const changed =
    !prev || prev.length !== next.length || prev.some((t, i) => t !== next[i]);
  if (changed) {
    recipe.mealTypes = next;
    updated += 1;
  }
}

writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Tagged ${updated} of ${catalog.recipes.length} recipes with mealTypes.`);
