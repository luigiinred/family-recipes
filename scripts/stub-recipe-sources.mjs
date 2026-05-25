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

/** slug → canonical popular recipe URL (JSON-LD friendly sites) */
export const STUB_SOURCES = {
  'caesar-salad': 'https://www.simplyrecipes.com/recipes/122816-caesar-salad/',
  'mediterranean-salad': 'https://www.loveandlemons.com/mediterranean-salad-recipe/',
  'air-fried-veggies-tilapia':
    'https://www.eatwell101.com/air-fryer-lemon-garlic-tilapia-recipe',
  'air-fried-veggies-shrimp': 'https://www.eatwell101.com/air-fryer-shrimp-recipe',
  'zero-calorie-pasta-veggies-shrimp':
    'https://www.eatwell101.com/shrimp-shirataki-noodle-stir-fry-recipe',
  'crema-salad': 'https://www.loveandlemons.com/mexican-street-corn-salad/',
  'falafel': 'https://www.themediterraneandish.com/how-to-make-falafel/',
  'freezer-soup': 'https://www.allrecipes.com/recipe/13113/veggie-soup/',
  'gigantes-butter-beans': 'https://www.themediterraneandish.com/gigantes-plaki-recipe/',
  'bean-chili': 'https://www.allrecipes.com/recipe/254201/vegetarian-chili/',
  ratatouille: 'https://www.simplyrecipes.com/recipes/ratatouille/',
  'orzo-salad': 'https://www.allrecipes.com/recipe/228014/mediterranean-orzo-salad/',
  'pasta-primavera': 'https://www.allrecipes.com/recipe/21719/pasta-primavera/',
  'potato-tacos': 'https://www.allrecipes.com/recipe/260289/potato-tacos/',
  'asian-chicken-lettuce-wraps':
    'https://www.eatwell101.com/asian-chicken-lettuce-wraps-recipe',
  'garlic-butter-sausages-broccoli-skillet':
    'https://www.eatwell101.com/garlic-butter-sausage-broccoli-recipe',
  'creamy-garlic-parmesan-chicken-mushrooms':
    'https://www.eatwell101.com/creamy-garlic-parmesan-chicken-with-mushrooms-recipe',
  'greek-chicken-marinade': 'https://www.gimmesomeoven.com/greek-chicken-marinade/',
  'best-greek-salad': 'https://www.themediterraneandish.com/greek-salad-recipe/',
  'chicken-veggie-stir-fry':
    'https://www.allrecipes.com/recipe/85889/quick-chicken-stir-fry/',
  'vegetarian-bibimbap-tofu': 'https://www.koreanbapsang.com/bibimbap/',
  'tom-kha-gai': 'https://hot-thai-kitchen.com/tom-kha-gai/',
  'authentic-greek-green-beans-fasolakia':
    'https://www.themediterraneandish.com/greek-green-beans-recipe-fasolakia/',
  'byl-bacon-wrapped-water-chestnuts':
    'https://www.allrecipes.com/recipe/238590/bacon-wrapped-water-chestnuts/',
  'byl-chicken-pot-pie': 'https://www.allrecipes.com/recipe/16167/chicken-pot-pie-ix/',
  'byl-glorious-treats':
    'https://www.allrecipes.com/recipe/10813/best-brownies/',
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
