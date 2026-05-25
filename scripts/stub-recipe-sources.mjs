/**
 * Popular source URLs for catalog stubs (no sourceUrl or empty body).
 * Run: node scripts/stub-recipe-sources.mjs
 * Then: node scripts/enrich-catalog-from-urls.mjs --stubs-only
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/static-api/data/recipes.json');

/** slug → working recipe URL (verified fetch + JSON-LD parse) */
export const STUB_SOURCES = {
  'caesar-salad': 'https://www.budgetbytes.com/caesar-salad/',
  'mediterranean-salad': 'https://www.wellplated.com/mediterranean-salad/',
  'air-fried-veggies-tilapia':
    'https://www.eatwell101.com/sheet-pan-tilapia-white-fish-recipe',
  'air-fried-veggies-shrimp': 'https://www.eatwell101.com/garlic-butter-shrimp-recipe',
  'zero-calorie-pasta-veggies-shrimp':
    'https://www.budgetbytes.com/lime-shrimp-dragon-noodles/',
  'crema-salad': 'https://www.loveandlemons.com/mexican-street-corn-salad/',
  falafel: 'https://www.themediterraneandish.com/how-to-make-falafel/',
  'freezer-soup': 'https://www.loveandlemons.com/vegetable-soup/',
  'gigantes-butter-beans': 'https://www.themediterraneandish.com/gigantes-plaki/',
  'bean-chili': 'https://www.allrecipes.com/recipe/254201/vegetarian-chili/',
  ratatouille: 'https://www.bbcgoodfood.com/recipes/ratatouille',
  'orzo-salad': 'https://www.loveandlemons.com/orzo-salad/',
  'pasta-primavera': 'https://www.budgetbytes.com/pasta-primavera/',
  'potato-tacos': 'https://www.budgetbytes.com/sweet-potato-tacos/',
  'asian-chicken-lettuce-wraps': 'https://www.budgetbytes.com/chicken-lettuce-wraps/',
  'garlic-butter-sausages-broccoli-skillet':
    'https://www.bbcgoodfood.com/recipes/sausage-broccoli-pasta',
  'creamy-garlic-parmesan-chicken-mushrooms':
    'https://www.budgetbytes.com/creamy-mushroom-chicken/',
  'greek-chicken-marinade':
    'https://www.themediterraneandish.com/greek-chicken-marinade/',
  'best-greek-salad': 'https://www.themediterraneandish.com/greek-salad/',
  'chicken-veggie-stir-fry': 'https://www.budgetbytes.com/chicken-stir-fry/',
  'vegetarian-bibimbap-tofu': 'https://www.koreanbapsang.com/bibimbap/',
  'tom-kha-gai': 'https://hot-thai-kitchen.com/tom-ka-gai/',
  'authentic-greek-green-beans-fasolakia':
    'https://www.themediterraneandish.com/greek-green-beans-fasolakia/',
  'byl-bacon-wrapped-water-chestnuts':
    'https://www.tasteofhome.com/recipes/bacon-wrapped-water-chestnuts/',
  'byl-chicken-pot-pie': 'https://www.budgetbytes.com/chicken-pot-pie/',
  'byl-glorious-treats':
    'https://sallysbakingaddiction.com/chewy-fudgy-homemade-brownies/',
};

function isStub(recipe) {
  return (
    recipe.ingredients.length === 0 ||
    /see source|recipe body empty/i.test(recipe.steps.join(' '))
  );
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
let assigned = 0;

for (const recipe of catalog.recipes) {
  if (!isStub(recipe)) continue;
  const url = STUB_SOURCES[recipe.slug];
  if (!url) {
    console.warn(`No source mapped for stub: ${recipe.slug}`);
    continue;
  }
  recipe.sourceUrl = url;
  assigned++;
  console.log(`Assigned ${recipe.slug} → ${url}`);
}

const json = JSON.stringify(catalog, null, 2) + '\n';
writeFileSync(catalogPath, json);
writeFileSync(join(root, 'public/data/recipes.json'), json);
console.log(`\nAssigned sourceUrl to ${assigned} stub recipes.`);
