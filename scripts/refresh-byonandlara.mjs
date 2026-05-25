#!/usr/bin/env node
/** Re-fetch and update all byl-* recipes after parser fixes. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRecipePage } from './lib/parse-byonandlara.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = join(root, 'src/static-api/data/recipes.json');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

async function main() {
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  let updated = 0;
  for (let i = 0; i < catalog.recipes.length; i++) {
    const r = catalog.recipes[i];
    if (!r.slug?.startsWith('byl-') || !r.sourceUrl) continue;
    const html = await fetch(r.sourceUrl, {
      headers: { 'User-Agent': UA },
    }).then((res) => res.text());
    const recipeId = r.sourceUrl.match(/recipe_id=(\d+)/)?.[1] || '';
    const parsed = parseRecipePage(html, {
      recipeId,
      title: r.title,
      sourceUrl: r.sourceUrl,
    });
    catalog.recipes[i] = {
      ...r,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      imageUrl: parsed.imageUrl || r.imageUrl,
      description: parsed.description,
      tags: parsed.tags,
    };
    updated++;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  const json = JSON.stringify(catalog, null, 2) + '\n';
  writeFileSync(catalogPath, json);
  writeFileSync(join(root, 'public/data/recipes.json'), json);
  console.log(`Refreshed ${updated} byonandlara recipes`);
}

main();
