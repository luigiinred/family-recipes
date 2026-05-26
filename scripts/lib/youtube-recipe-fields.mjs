import { extractRecipeUrlsFromText } from './extract-recipe-url-from-text.mjs';
import { parseDescriptionRecipe } from './fetch-youtube-timed-steps.mjs';
import { simplifyRecipeTitle } from './simplify-recipe-title.mjs';

/**
 * Ingredients from YouTube description RECIPE blocks (independent of step source).
 * @param {string} description
 * @returns {{ amount: string, unit: string, name: string }[]}
 */
export function ingredientsFromYouTubeDescription(description) {
  const inline = parseDescriptionRecipe(description || '');
  return inline?.ingredients?.length ? inline.ingredients : [];
}

/**
 * Prefer themediterraneandish / bit.ly links, then any other non-social URL.
 * @param {string} description
 * @returns {string}
 */
export function primaryRecipeUrlFromDescription(description) {
  const text = description || '';
  const mediterranean = text.match(
    /https?:\/\/(?:www\.)?themediterraneandish\.com\/[^\s)]+/i,
  );
  if (mediterranean) return mediterranean[0].replace(/[.,]+$/, '');
  const meddish = text.match(/https?:\/\/themeddish\.com\/[^\s)]+/i);
  if (meddish) {
    return 'https://www.themediterraneandish.com/sheet-pan-gnocchi-with-roasted-vegetables/';
  }
  const bitly = text.match(/https?:\/\/bit\.ly\/[^\s)]+/i);
  if (bitly) return bitly[0].replace(/[.,]+$/, '');
  const urls = extractRecipeUrlsFromText(text);
  const recipeSite = urls.find((u) =>
    /epicurious|allrecipes|seriouseats|bonappetit|themediterraneandish|sipandfeast|foodnetwork|simplyrecipes|budgetbytes/i.test(
      u,
    ),
  );
  return recipeSite ?? urls[0] ?? '';
}

/**
 * @param {string} rawTitle
 * @returns {string}
 */
export function displayTitleFromYouTube(rawTitle) {
  return simplifyRecipeTitle(rawTitle || '');
}
