const SKIP_HOST =
  /(?:youtube\.com|youtu\.be|instagram\.com|facebook\.com|twitter\.com|x\.com|ko-fi\.com|patreon\.com|amazon\.|amzn\.to|linktr\.ee)/i;

/**
 * Pull candidate recipe page URLs from free text (e.g. YouTube descriptions).
 * @param {string} text
 * @returns {string[]}
 */
export function extractRecipeUrlsFromText(text) {
  if (!text) return [];
  const seen = new Set();
  const urls = [];
  for (const match of text.matchAll(/https?:\/\/[^\s)>\]]+/gi)) {
    const url = match[0].replace(/[.,;:!?]+$/, '');
    if (SKIP_HOST.test(url) || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}
