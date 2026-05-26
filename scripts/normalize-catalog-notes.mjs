#!/usr/bin/env node
/**
 * Move note/tip steps into recipe.notes; scan description for NOTE/TIPS blocks.
 *
 *   npm run normalize:notes
 *   node scripts/normalize-catalog-notes.mjs --slug=air-fried-veggies-tilapia
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyRecipeNotes } from './lib/recipe-notes.mjs';
import { polishRecipeSteps } from './lib/recipe-steps.mjs';

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
  const before = JSON.stringify({
    steps: recipe.steps,
    notes: recipe.notes,
    timedSteps: recipe.timedSteps,
  });
  const next = applyRecipeNotes({
    ...recipe,
    steps: polishRecipeSteps(recipe.steps),
  });
  recipe.steps = polishRecipeSteps(next.steps);
  if (next.notes) recipe.notes = next.notes;
  else delete recipe.notes;
  if (next.timedSteps) recipe.timedSteps = next.timedSteps;
  else if (recipe.timedSteps?.length === 0) delete recipe.timedSteps;

  const after = JSON.stringify({
    steps: recipe.steps,
    notes: recipe.notes,
    timedSteps: recipe.timedSteps,
  });
  if (before !== after) {
    updated += 1;
    console.log(
      `  ✓ ${recipe.slug} — ${recipe.steps.length} steps` +
        (recipe.notes ? `, notes (${recipe.notes.length} chars)` : ''),
    );
  }
}

if (!slugFilter || updated) {
  const json = `${JSON.stringify(catalog, null, 2)}\n`;
  writeFileSync(catalogPath, json);
  writeFileSync(join(root, 'public/data/recipes.json'), json);
}

console.log(`\nNormalized notes on ${updated} recipe(s).`);
