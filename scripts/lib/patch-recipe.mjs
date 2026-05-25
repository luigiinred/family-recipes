import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function loadCatalog() {
  const path = join(root, 'src/static-api/data/recipes.json');
  return { path, catalog: JSON.parse(readFileSync(path, 'utf8')) };
}

export function saveCatalog(path, catalog) {
  const json = JSON.stringify(catalog, null, 2) + '\n';
  writeFileSync(path, json);
  writeFileSync(join(root, 'public/data/recipes.json'), json);
}

export function patchRecipe(slug, patch) {
  const { path, catalog } = loadCatalog();
  const idx = catalog.recipes.findIndex((r) => r.slug === slug);
  if (idx === -1) throw new Error(`Unknown slug: ${slug}`);
  catalog.recipes[idx] = { ...catalog.recipes[idx], ...patch };
  saveCatalog(path, catalog);
  return catalog.recipes[idx];
}
