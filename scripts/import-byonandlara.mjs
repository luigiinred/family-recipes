#!/usr/bin/env node
/**
 * Import all recipes from http://www.byonandlara.com/recipes/
 * Merges into src/static-api/data/recipes.json (skips duplicates by externalId or slug).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseIndexPage,
  parseRecipePage,
  slugify,
} from './lib/parse-byonandlara.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/static-api/data/recipes.json');
const INDEX_URL = 'http://www.byonandlara.com/recipes/';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function nextNumericId(recipes) {
  const max = recipes.reduce(
    (n, r) => Math.max(n, Number.parseInt(r.id, 10) || 0),
    0,
  );
  return String(max + 1);
}

async function main() {
  const indexHtml = await fetchText(INDEX_URL);
  const indexItems = parseIndexPage(indexHtml);
  console.log(`Found ${indexItems.length} recipes on index`);

  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const existingSlugs = new Set(catalog.recipes.map((r) => r.slug));
  const existingExternal = new Set(
    catalog.recipes.map((r) => r.externalId).filter(Boolean),
  );

  const added = [];
  const skipped = [];

  for (const item of indexItems) {
    const html = await fetchText(item.sourceUrl);
    const parsed = parseRecipePage(html, item);

    if (existingSlugs.has(parsed.slug) || existingExternal.has(parsed.externalId)) {
      skipped.push({ title: parsed.title, reason: 'already imported' });
      continue;
    }
    const dupNote = catalog.recipes.find(
      (r) =>
        slugify(r.title) === slugify(parsed.title) ||
        r.sourceUrl === parsed.sourceUrl,
    );
    if (dupNote) {
      skipped.push({ title: parsed.title, reason: 'title/url duplicate' });
      continue;
    }

    const id = nextNumericId(catalog.recipes);
    catalog.recipes.push({
      id,
      ...parsed,
    });
    existingSlugs.add(parsed.slug);
    added.push(parsed.slug);
    await new Promise((r) => setTimeout(r, 200));
  }

  const json = JSON.stringify(catalog, null, 2) + '\n';
  writeFileSync(catalogPath, json);
  writeFileSync(join(root, 'public/data/recipes.json'), json);

  console.log(`Added ${added.length} recipes`);
  if (skipped.length) console.log('Skipped:', skipped);
  console.log(`Total catalog size: ${catalog.recipes.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
