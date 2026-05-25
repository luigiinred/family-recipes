#!/usr/bin/env node
/**
 * Enrich recipes.json entries that have sourceUrl with ingredients, steps, image, times.
 * Run: node scripts/enrich-catalog-from-urls.mjs [--slug=briam] [--dry-run]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRecipeHtml } from './lib/parse-recipe-html.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/static-api/data/recipes.json');
const enrichDir = join(root, 'src/static-api/data/enrichments');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const slugFilter = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function mergeRecipe(existing, scraped) {
  const placeholder =
    existing.steps?.length === 1 &&
    /see source/i.test(existing.steps[0] || '');

  return {
    ...existing,
    description:
      scraped.description && scraped.description.length > 20
        ? scraped.description
        : existing.description,
    imageUrl: scraped.imageUrl || existing.imageUrl,
    prepMinutes: scraped.prepMinutes || existing.prepMinutes,
    cookMinutes: scraped.cookMinutes || existing.cookMinutes,
    servings: scraped.servings || existing.servings,
    ingredients:
      scraped.ingredients?.length > 0
        ? scraped.ingredients
        : existing.ingredients,
    steps:
      scraped.steps?.length > 0
        ? scraped.steps
        : placeholder
          ? existing.steps
          : existing.steps,
  };
}

async function enrichOne(recipe) {
  const url = recipe.sourceUrl;
  console.log(`Fetching ${recipe.slug} …`);
  const html = await fetchHtml(url);
  const scraped = parseRecipeHtml(html);
  if (!scraped) {
    console.warn(`  ⚠ No recipe data parsed for ${recipe.slug}`);
    return { recipe, scraped: null, ok: false };
  }
  const merged = mergeRecipe(recipe, scraped);
  console.log(
    `  ✓ ${scraped.source}: ${merged.ingredients.length} ingredients, ${merged.steps.length} steps` +
      (merged.imageUrl ? ', image' : ''),
  );
  return { recipe: merged, scraped, ok: true };
}

async function main() {
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  let targets = catalog.recipes.filter((r) => r.sourceUrl);
  if (slugFilter) targets = targets.filter((r) => r.slug === slugFilter);

  mkdirSync(enrichDir, { recursive: true });
  const results = { ok: [], failed: [] };

  for (const recipe of targets) {
    try {
      const { recipe: merged, scraped, ok } = await enrichOne(recipe);
      if (ok) {
        const idx = catalog.recipes.findIndex((r) => r.id === recipe.id);
        catalog.recipes[idx] = merged;
        writeFileSync(
          join(enrichDir, `${recipe.slug}.json`),
          JSON.stringify({ scraped, merged }, null, 2),
        );
        results.ok.push(recipe.slug);
      } else {
        results.failed.push({ slug: recipe.slug, reason: 'parse-failed' });
      }
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      console.error(`  ✗ ${recipe.slug}: ${err.message}`);
      results.failed.push({ slug: recipe.slug, reason: err.message });
    }
  }

  console.log('\nSummary:', results);
  if (!dryRun && results.ok.length) {
    const json = JSON.stringify(catalog, null, 2) + '\n';
    writeFileSync(catalogPath, json);
    writeFileSync(join(root, 'public/data/recipes.json'), json);
    console.log(`Updated ${catalogPath}`);
  } else if (dryRun) {
    console.log('Dry run — catalog not written');
  }
}

main();
