/**
 * Parse Garrabrant Family Recipes (byonandlara.com) index and detail pages.
 */

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseIndexPage(html) {
  const re =
    /<a href="\?recipe_id=(\d+)">[^<]*<img[^>]*>[^<]*<br>([^<]+)<\/a>/gi;
  const items = [];
  let m;
  while ((m = re.exec(html))) {
    items.push({
      recipeId: m[1],
      title: m[2].trim(),
      sourceUrl: `http://www.byonandlara.com/recipes/?recipe_id=${m[1]}`,
    });
  }
  return items;
}

function parseIngredientLine(text) {
  const line = text.replace(/<br\s*\/?>/gi, '').trim();
  if (!line) return { amount: '', unit: '', name: '' };
  const measured = line.match(
    /^([\d./\s¼½¾-]+)\s+([a-zA-Z]+)\s+(.+)$/,
  );
  if (measured) {
    return {
      amount: measured[1].trim(),
      unit: measured[2].trim(),
      name: measured[3].trim(),
    };
  }
  return { amount: '', unit: '', name: line };
}

const CATEGORY_TAGS = {
  Appetizers: ['appetizer', 'family'],
  Soups: ['soup', 'family'],
  Salads: ['salad', 'family'],
  'Main Dishes': ['main', 'family'],
  'Side Dishes': ['side', 'family'],
  Sweets: ['dessert', 'family'],
  'Breakfast & Brunch': ['breakfast', 'family'],
  Others: ['family'],
};

export function parseRecipePage(html, meta) {
  const titleMatch = html.match(
    /<div[^>]*align="left"[^>]*><b>([^<]+)<\/b>/i,
  );
  const title = titleMatch?.[1]?.trim() || meta.title;

  const categoryMatch = html.match(
    /align="right"[^>]*><b>([^<]+)<\/b>/i,
  );
  const category = categoryMatch?.[1]?.trim() || 'Others';
  const tags = CATEGORY_TAGS[category] || ['family'];

  const imgMatch =
    html.match(/type=['"]image['"]\s+src=['"]([^'"]+)['"]/i) ||
    html.match(/src=['"]([^'"]+)['"][^>]*width=['"]50%/i);
  const imageUrl = imgMatch?.[1]?.replace(/\\\//g, '/') || '';

  const ingredients = [];
  for (const ulMatch of html.matchAll(/<ul>([\s\S]*?)<\/ul>/gi)) {
    for (const m of ulMatch[1].matchAll(/<li>\s*([^<]+)/gi)) {
      const text = m[1].replace(/<br\s*\/?>/gi, '').trim();
      if (text) ingredients.push(parseIngredientLine(text));
    }
  }

  const steps = [];
  for (const olMatch of html.matchAll(/<ol>([\s\S]*?)<\/ol>/gi)) {
    for (const m of olMatch[1].matchAll(/<li>\s*([^<]+)/gi)) {
      const text = m[1].replace(/<br\s*\/?>/gi, '').trim();
      if (text) steps.push(text);
    }
  }

  const introMatch = html.match(
    /width=['"]50%['"]\s*\/?>([^<]+(?:<br[^>]*>)?)\s*<ul>/i,
  );
  const introNote = introMatch
    ? introMatch[1].replace(/<br\s*\/?>/gi, ' ').trim()
    : '';

  return {
    slug: `byl-${slugify(title)}`,
    title,
    description: `${title} — Garrabrant family recipe (${category}).`,
    imageUrl,
    prepMinutes: 0,
    cookMinutes: 0,
    servings: 4,
    tags,
    ingredients,
    steps: steps.length
      ? steps
      : [
          'Recipe body empty on byonandlara.com — open source link to view or add steps manually.',
        ],
    sourceUrl: meta.sourceUrl,
    mealLists: ['saved'],
    notes: [
      `Imported from byonandlara.com (recipe_id=${meta.recipeId}, ${category})`,
      introNote,
    ]
      .filter(Boolean)
      .join(' '),
    externalId: `byl-${meta.recipeId}`,
  };
}
