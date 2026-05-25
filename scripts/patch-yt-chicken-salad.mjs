#!/usr/bin/env node
/**
 * Fill ingredients for YouTube chicken salad (no JSON-LD on watch page).
 * Companion text recipe: Wholesomelicious Mediterranean no-mayo salad.
 */
import { patchRecipe } from './lib/patch-recipe.mjs';
import { parseRecipeHtml } from './lib/parse-recipe-html.mjs';

const COMPANION =
  'https://www.wholesomelicious.com/creamy-mediterranean-chicken-salad-no-mayo/';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const res = await fetch(COMPANION, {
  headers: { 'User-Agent': UA, Accept: 'text/html' },
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const scraped = parseRecipeHtml(await res.text());
if (!scraped?.ingredients?.length) throw new Error('No ingredients parsed');

const recipe = patchRecipe('yt-a-healthy-no-mayo-chicken-salad-recipe', {
  ingredients: scraped.ingredients,
  prepMinutes: scraped.prepMinutes || 20,
  cookMinutes: scraped.cookMinutes || 0,
  servings: scraped.servings || 4,
  notes:
    'Video: youtube.com/watch?v=4xQsTOxTQsQ. Ingredient list from companion no-mayo Mediterranean chicken salad (wholesomelicious.com).',
});

console.log(
  `Patched ${recipe.slug}: ${recipe.ingredients.length} ingredients, image=${!!recipe.imageUrl}`,
);
