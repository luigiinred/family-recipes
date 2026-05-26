#!/usr/bin/env node
/**
 * Repair ingredient amount/unit fields and infer section groups across the catalog.
 *
 *   node scripts/normalize-catalog-ingredients.mjs
 *   node scripts/normalize-catalog-ingredients.mjs --slug=air-fried-veggies-tilapia
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeCatalogIngredients } from './lib/ingredient-lines.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/static-api/data/recipes.json');

const slugFilter = process.argv
  .find((a) => a.startsWith('--slug='))
  ?.slice('--slug='.length);

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
let updated = 0;

for (const recipe of catalog.recipes) {
  if (slugFilter && recipe.slug !== slugFilter) continue;
  const next = normalizeCatalogIngredients(recipe.ingredients, {
    title: recipe.title,
    steps: recipe.steps,
  });
  const changed = JSON.stringify(next) !== JSON.stringify(recipe.ingredients);
  if (changed) {
    recipe.ingredients = next;
    updated += 1;
    console.log(`  ✓ ${recipe.slug} (${next.length} ingredients)`);
  }
}

if (!slugFilter || updated) {
  const json = `${JSON.stringify(catalog, null, 2)}\n`;
  writeFileSync(catalogPath, json);
  writeFileSync(join(root, 'public/data/recipes.json'), json);
}

console.log(`\nNormalized ingredients on ${updated} recipe(s).`);
