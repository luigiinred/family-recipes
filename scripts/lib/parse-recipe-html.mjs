/**
 * Extract Recipe fields from HTML (JSON-LD first, then heuristics).
 */

function normalizeType(type) {
  if (!type) return '';
  if (Array.isArray(type)) return type.join(' ');
  return String(type);
}

function isRecipeNode(node) {
  const t = normalizeType(node?.['@type']);
  return t.includes('Recipe');
}

function collectRecipeNodes(data, out) {
  if (!data || typeof data !== 'object') return;
  if (Array.isArray(data)) {
    for (const item of data) collectRecipeNodes(item, out);
    return;
  }
  if (isRecipeNode(data)) out.push(data);
  if (data['@graph']) collectRecipeNodes(data['@graph'], out);
}

function extractBalancedJsonObject(html, startIdx) {
  const open = html.indexOf('{', startIdx);
  if (open === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = open; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(open, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** Recipe schema embedded in inline JS (Eatwell101, some WordPress themes). */
function extractInlineRecipeObjects(html) {
  const found = [];
  const markers = ['"@type":"Recipe"', '"@type": "Recipe"', "'@type':'Recipe'"];
  for (const marker of markers) {
    let from = 0;
    while (from < html.length) {
      const idx = html.indexOf(marker, from);
      if (idx === -1) break;
      const obj = extractBalancedJsonObject(html, Math.max(0, idx - 200));
      if (obj && isRecipeNode(obj)) found.push(obj);
      from = idx + marker.length;
    }
  }
  return found;
}

export function extractJsonLdRecipes(html) {
  const found = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      collectRecipeNodes(parsed, found);
    } catch {
      /* skip invalid JSON-LD */
    }
  }
  for (const inline of extractInlineRecipeObjects(html)) {
    if (!found.some((f) => f.name === inline.name && f.url === inline.url)) {
      found.push(inline);
    }
  }
  return found;
}

function extractOgImage(html) {
  const m =
    html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  return m?.[1]?.replace(/\\\//g, '/') || '';
}

function parseIsoDuration(iso) {
  if (!iso || typeof iso !== 'string') return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const mins = Number(match[2] || 0);
  return hours * 60 + mins;
}

function parseIngredientLine(line) {
  const text = line.replace(/^[-•*\d.]+\s*/, '').trim();
  if (!text) return { amount: '', unit: '', name: text };
  const m = text.match(
    /^([\d¼½¾⅓⅔./\s-]+)?\s*([a-zA-Z]+(?:\.|))?\s*(.+)$/,
  );
  if (!m) return { amount: '', unit: '', name: text };
  return {
    amount: (m[1] || '').trim(),
    unit: (m[2] || '').trim(),
    name: (m[3] || text).trim(),
  };
}

function normalizeIngredients(recipe) {
  const raw = recipe.recipeIngredient;
  if (!raw) return [];
  const lines = Array.isArray(raw)
    ? raw
    : typeof raw === 'object'
      ? Object.values(raw)
      : [raw];
  return lines
    .map((line) => {
      if (typeof line === 'string') return parseIngredientLine(line);
      if (line && typeof line === 'object') {
        const text =
          line.text ||
          line.name ||
          line.description ||
          (line['@type'] === 'HowToSupply' ? line.name : null);
        if (text) return parseIngredientLine(String(text));
      }
      return { amount: '', unit: '', name: String(line) };
    })
    .filter((i) => i.name && i.name !== '[object Object]');
}

function normalizeSteps(recipe) {
  const raw = recipe.recipeInstructions;
  if (!raw) return [];
  if (typeof raw === 'string') return [raw.trim()].filter(Boolean);
  if (Array.isArray(raw)) {
    return raw
      .map((step) => {
        if (typeof step === 'string') return step.trim();
        if (step?.text) return String(step.text).trim();
        if (step?.name) return String(step.name).trim();
        return '';
      })
      .filter(Boolean);
  }
  return [];
}

function normalizeImage(recipe) {
  const img = recipe.image;
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (Array.isArray(img)) {
    const first = img[0];
    if (typeof first === 'string') return first;
    return first?.url || '';
  }
  return img.url || '';
}

export function recipeFromJsonLd(node) {
  if (!node) return null;
  const prep = parseIsoDuration(node.prepTime);
  const cook = parseIsoDuration(node.cookTime);
  const total = parseIsoDuration(node.totalTime);
  let cookMinutes = cook;
  let prepMinutes = prep;
  if (!prepMinutes && !cookMinutes && total) {
    cookMinutes = total;
  }
  const ingredients = normalizeIngredients(node);
  const steps = normalizeSteps(node);
  const servings = Number.parseInt(String(node.recipeYield || '4'), 10) || 4;

  return {
    title: node.name || '',
    description: (node.description || '').replace(/\s+/g, ' ').trim().slice(0, 500),
    imageUrl: normalizeImage(node),
    prepMinutes: prepMinutes || 0,
    cookMinutes: cookMinutes || 0,
    servings: Number.isFinite(servings) ? servings : 4,
    ingredients,
    steps,
  };
}

/** Parse bullet lists under Ingredients / Instructions headings in HTML or markdown text */
function extractListSection(html, headingPattern) {
  const items = [];
  const re = new RegExp(
    `(?:<h[23][^>]*>\\s*${headingPattern}[^<]*</h[23]>|[#]{1,3}\\s*${headingPattern}[^\\n]*)\\s*([\\s\\S]*?)(?=<h[23]|### |## |$)`,
    'i',
  );
  const m = html.match(re);
  if (!m) return items;
  const block = m[1];
  for (const line of block.split('\n')) {
    const t = line.trim();
    if (/^[-•*]\s+/.test(t)) items.push(t.replace(/^[-•*]\s+/, '').trim());
    if (/^\d+\.\s+/.test(t)) items.push(t.replace(/^\d+\.\s+/, '').trim());
  }
  return items;
}

export function recipeFromPageSections(html) {
  const ingLines = [
    ...extractListSection(html, 'Ingredients'),
    ...extractListSection(html, 'For the fish'),
    ...extractListSection(html, 'For the sauce'),
  ];
  const stepLines = extractListSection(html, 'Instructions');
  if (!ingLines.length && !stepLines.length) return null;
  return {
    ingredients: ingLines.map((l) => parseIngredientLine(l)),
    steps: stepLines,
    imageUrl: extractOgImage(html),
    prepMinutes: 0,
    cookMinutes: 0,
    servings: 4,
  };
}

/** Fallback: markdown-style Ingredients / Instructions sections from fetched text */
export function recipeFromMarkdownSections(text) {
  const ingredients = [];
  const steps = [];
  const lines = text.split('\n');

  let mode = null;
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (/^#{1,3}\s*ingredients/.test(lower) || lower === 'ingredients') {
      mode = 'ingredients';
      continue;
    }
    if (
      /^#{1,3}\s*(instructions|directions|method)/.test(lower) ||
      lower === 'instructions' ||
      lower === 'directions'
    ) {
      mode = 'steps';
      continue;
    }
    if (/^#{1,3}\s/.test(line) && mode) {
      mode = null;
    }
    if (mode === 'ingredients' && /^[-•*]\s+/.test(line.trim())) {
      ingredients.push(parseIngredientLine(line.trim()));
    }
    if (mode === 'steps' && /^\d+\.\s+/.test(line.trim())) {
      steps.push(line.trim().replace(/^\d+\.\s+/, ''));
    }
  }

  if (!ingredients.length && !steps.length) return null;
  return { ingredients, steps, imageUrl: '', prepMinutes: 0, cookMinutes: 0, servings: 4 };
}

export function parseRecipeHtml(html, fallbackText = '') {
  const jsonLd = extractJsonLdRecipes(html);
  for (const node of jsonLd) {
    const parsed = recipeFromJsonLd(node);
    if (parsed && (parsed.ingredients.length || parsed.steps.length)) {
      const imageUrl = parsed.imageUrl || extractOgImage(html);
      return { ...parsed, imageUrl, source: 'json-ld' };
    }
  }
  const sections = recipeFromPageSections(html);
  if (sections && (sections.ingredients.length || sections.steps.length)) {
    const imageUrl = sections.imageUrl || extractOgImage(html);
    return { ...sections, imageUrl, source: 'html-sections' };
  }
  const md = recipeFromMarkdownSections(fallbackText || html);
  if (md) {
    const imageUrl = md.imageUrl || extractOgImage(html);
    return { ...md, imageUrl, source: 'markdown' };
  }
  return null;
}
