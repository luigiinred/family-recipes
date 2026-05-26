/**
 * Parse, filter, and order recipe ingredient lines (especially from YouTube descriptions).
 */

import {
  formatIngredientForCatalog,
  formatIngredientName,
  formatIngredientUnit,
  normalizeIngredientUnit,
} from '../../src/static-api/units.ts';

export { formatIngredientForCatalog, formatIngredientName, formatIngredientUnit };

/** Count / produce descriptors — not measure units, but valid in `unit` when amount is set. */
const COUNT_UNIT_WORDS = new Set([
  'large',
  'medium',
  'small',
  'head',
  'clove',
  'cloves',
  'can',
  'cans',
  'piece',
  'pieces',
  'bunch',
  'stalk',
  'stalks',
  'fillet',
  'fillets',
  'sprig',
  'sprigs',
  'slice',
  'slices',
  'bag',
  'pack',
  'cluster',
]);

const MEASURE_WORD =
  /^(?:tsp|teaspoons?|tbsp|tablespoons?|cups?|oz|lb|g|kg|ml|l|liters?|pinch|cloves?)$/i;

/**
 * Eatwell101 and similar parsers drop the leading `1` from `1/2` → `/2`.
 * @param {string} amount
 */
export function fixBrokenAmount(amount) {
  const t = (amount || '').trim();
  if (/^\/\d+$/.test(t)) return `1${t}`;
  return t;
}

/**
 * @param {string} unit
 */
function isCountDescriptor(unit) {
  return COUNT_UNIT_WORDS.has((unit || '').trim().toLowerCase());
}

/**
 * @param {string} name
 * @param {string} canonicalUnit
 * @param {string[]} steps
 */
function amountFromSteps(name, canonicalUnit, steps) {
  const firstWord = name.split(/[,(]/)[0].trim().toLowerCase();
  if (!firstWord) return '';
  const unitWords =
    canonicalUnit === 'Tbsp'
      ? 'tablespoons?|tbsp'
      : canonicalUnit === 'tsp'
        ? 'teaspoons?|tsp'
        : canonicalUnit === 'cup'
          ? 'cups?'
          : canonicalUnit;
  const re = new RegExp(
    `(\\d+(?:\\.\\d+)?(?:\\s*\\/\\s*\\d+)?)\\s*(?:${unitWords})\\s+(?:of\\s+)?([\\w][\\w\\s-]*?)(?=\\s*,|\\s+and\\b|\\.|$)`,
    'gi',
  );
  for (const step of steps) {
    let m;
    while ((m = re.exec(step))) {
      const fragment = m[2].trim().toLowerCase();
      if (
        fragment.startsWith(firstWord) ||
        firstWord.startsWith(fragment.split(/\s+/)[0])
      ) {
        return fixBrokenAmount(m[1].replace(/\s+/g, ''));
      }
    }
  }
  return '';
}

/**
 * @param {{ amount: string, unit: string, name: string, group?: string }} ing
 * @param {string[]} [steps]
 */
export function repairIngredientFields(ing, steps = []) {
  let { amount, unit, name, group } = ing;
  amount = fixBrokenAmount(amount);

  const canonical = normalizeIngredientUnit(unit);
  const unitTrim = (unit || '').trim();

  // Measure stored in `unit` with empty `amount` (e.g. unit `tablespoon`, name `honey`).
  if (!amount && canonical) {
    amount = amountFromSteps(name, canonical, steps) || '1';
    unit = canonical;
    return formatIngredientForCatalog({ amount, unit, name, group });
  }

  // Amount embedded in name: `1/2 tbsp chili powder` stored as amount `1`, name `3/4 tsp paprika`.
  const embedded = name.match(
    /^(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)\s*((?:oz|lb|g|kg|ml|l|liters?|Tbsp|tbsp|tsp|cups?|cans?)\b\.?)\s+(.+)$/i,
  );
  if (embedded && (!canonical || amount === '1')) {
    amount = embedded[1].replace(/\s+/g, '');
    unit = normalizeIngredientUnit(embedded[2]) || embedded[2];
    name = embedded[3];
  }

  // Mis-parse: protein or veg in `unit` (e.g. unit `tilapia`, name `fillets`).
  if (!canonical && unitTrim && !isCountDescriptor(unitTrim)) {
    const reparsed = parseIngredientLineRich(
      [amount, unit, name].filter(Boolean).join(' '),
    );
    if (reparsed.name) {
      return formatIngredientForCatalog({ ...reparsed, group });
    }
  }

  // Split combined olive oil note.
  if (/\+\s*\d+.*for\s+veg/i.test(name) && /olive\s+oil/i.test(name)) {
    return formatIngredientForCatalog({
      amount: amount || '2',
      unit: canonical || 'Tbsp',
      name: 'olive oil (for vegetables)',
      group,
    });
  }

  if (canonical) unit = canonical;
  amount = fixBrokenAmount(amount);

  const cleaned = cleanIngredientNameFields({ amount, unit, name });
  return formatIngredientForCatalog({ ...cleaned, group });
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} name
 */
export function isGarnishIngredient(name) {
  return /(?:for\s+)?garnish|garnish\b|to serve/i.test(name || '');
}

/**
 * @param {string} step
 */
function sauceGroupLabel(step) {
  if (/chili.*lime|lime.*chili/i.test(step)) return 'Chili-lime sauce';
  if (/marinade/i.test(step)) return 'Marinade';
  if (/dressing/i.test(step)) return 'Dressing';
  if (/vinaigrette/i.test(step)) return 'Vinaigrette';
  if (/seasoning\s+blend|spice\s+blend/i.test(step)) return 'Seasoning blend';
  return 'Sauce';
}

/**
 * @param {{ amount: string, unit: string, name: string }} ing
 * @param {string} step
 */
function ingredientMentionedInStep(ing, step) {
  const hay = step.toLowerCase();
  const tokens = ing.name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .split(/[\s,]+/)
    .filter((w) => w.length > 2);
  const hits = tokens.filter((t) => hay.includes(t));
  return hits.length >= 1 && (hits.length >= 2 || tokens[0].length >= 4);
}

/**
 * Assign `group` for sauces (whisk step), marinades, and garnishes.
 * @param {{ amount: string, unit: string, name: string, group?: string }[]} ingredients
 * @param {string[]} [steps]
 */
export function inferIngredientGroups(ingredients, steps = []) {
  const sauceStep = steps.find((s) =>
    /whisk(?:\s+together)?|stir together|in a (?:small )?bowl|make the (?:sauce|dressing|marinade)/i.test(
      s,
    ),
  );
  const sauceLabel = sauceStep ? sauceGroupLabel(sauceStep) : 'Sauce';
  const vegStep = steps.find((s) =>
    /sweet potato|broccoli|vegetable|toss.*oil/i.test(s),
  );

  return ingredients.map((ing) => {
    if (ing.group) return ing;
    if (isGarnishIngredient(ing.name)) {
      return { ...ing, group: 'Garnishes' };
    }
    if (sauceStep && ingredientMentionedInStep(ing, sauceStep)) {
      if (/for vegetables/i.test(ing.name)) return ing;
      return { ...ing, group: sauceLabel };
    }
    if (vegStep && /for vegetables/i.test(ing.name)) {
      return { ...ing, group: 'Vegetables' };
    }
    if (
      vegStep &&
      !ing.group &&
      /sweet potato|broccoli|cauliflower|zucchini|bell pepper|green beans/i.test(
        ing.name,
      )
    ) {
      return { ...ing, group: 'Vegetables' };
    }
    return ing;
  });
}

const GROUP_ORDER = [
  '',
  'Vegetables',
  'Chili-lime sauce',
  'Sauce',
  'Marinade',
  'Dressing',
  'Vinaigrette',
  'Seasoning blend',
  'Garnishes',
];

/**
 * Keep section blocks contiguous for `groupIngredients()` UI.
 * @param {{ amount: string, unit: string, name: string, group?: string }[]} ingredients
 */
export function orderIngredientSections(ingredients) {
  const labelOrder = (group) => {
    const g = group?.trim() ?? '';
    const idx = GROUP_ORDER.indexOf(g);
    return idx === -1 ? GROUP_ORDER.length : idx;
  };
  return [...ingredients].sort(
    (a, b) => labelOrder(a.group) - labelOrder(b.group),
  );
}

const MAIN_PROTEINS = [
  'chicken',
  'beef',
  'pork',
  'turkey',
  'fish',
  'salmon',
  'shrimp',
  'tofu',
  'lamb',
  'sausage',
  'bacon',
];

/** Lines that are not food (hashtags, music credits, disclaimers). */
export function isJunkIngredientName(name) {
  const t = (name || '').trim();
  if (!t || t.length < 2) return true;
  if (/^#+\w|(?:^|\s)#\w+/i.test(t)) return true;
  if (/^\|\|\s*music\s*\|\|/i.test(t)) return true;
  if (/bensound\.com/i.test(t)) return true;
  if (/^\*\*disclaimer/i.test(t)) return true;
  if (/^https?:\/\//i.test(t)) return true;
  if (/youtube\.com|playlist\?list=/i.test(t)) return true;
  if (/^(full recipe|more |popular products|my cookbook|shop:|website:|subscribe)/i.test(t)) {
    return true;
  }
  if (/instagram|my gear|chapters:/i.test(t)) return true;
  if (/^🎧?\s*music:/i.test(t)) return true;
  if (/epidemic sound/i.test(t)) return true;
  if (/^#[\w#]+\s/i.test(t) || /^#[\w]+(\s+#\w+)+$/i.test(t)) return true;
  if (/^JAPCHAE$/i.test(t)) return true;
  if (/^\d+:\d{2}\s/i.test(t)) return true;
  if (/^(intro|outro),?\s/i.test(t) && /\d+:\d{2}/.test(t)) return true;
  return false;
}

/**
 * @param {{ amount: string, unit: string, name: string }[]} ingredients
 */
export function scoreIngredients(ingredients) {
  if (!ingredients?.length) return 0;
  let score = ingredients.length * 5;
  for (const ing of ingredients) {
    if (isJunkIngredientName(ing.name)) score -= 40;
    if (/^\d+:\d{2}\s/.test(ing.name)) score -= 40;
    if (/^CHAPTERS:/i.test(ing.name)) score -= 40;
    if (ing.amount && /^\/\d/.test(ing.amount)) score -= 8;
    if (ing.name && /^[A-Z][a-z]+ [A-Z]/.test(ing.name)) score -= 3;
  }
  return score;
}

/**
 * @param {{ amount: string, unit: string, name: string }[]} current
 * @param {{ amount: string, unit: string, name: string }[]} candidate
 * @param {string} [title]
 */
export function pickBetterIngredients(current, candidate, title = '') {
  const cur = normalizeCatalogIngredients(current || [], { title });
  const cand = normalizeCatalogIngredients(candidate || [], { title });
  if (!cand.length) return cur;
  if (!cur.length) return cand;
  return scoreIngredients(cand) > scoreIngredients(cur) ? cand : cur;
}

/** Salt and table pepper are assumed on hand — omit from ingredient lists. */
export function isImplicitSaltPepper(name) {
  const t = (name || '').trim().toLowerCase();
  if (!t) return false;
  if (isProduceOrSpicePepper(t)) return false;
  if (/^salt\b/.test(t)) return true;
  if (/^kosher\s+salt\b/.test(t)) return true;
  if (/^sea\s+salt\b/.test(t)) return true;
  if (/^(fresh(ly)?\s+)?(ground\s+)?(black|white)\s+pepper\b/.test(t)) return true;
  if (/^pepper\s+to\s+taste/.test(t)) return true;
  return false;
}

/** @deprecated use isImplicitSaltPepper */
export function isImplicitSalt(name) {
  return isImplicitSaltPepper(name);
}

function isProduceOrSpicePepper(name) {
  return (
    /\b(bell|sweet)\s+pepper\b/.test(name) ||
    /\b(red|yellow|green)\s+(bell\s+)?pepper\b/.test(name) ||
    /\b(chili|chile|jalapeño|habanero|serrano|poblano|anaheim|bird[- ]eye)\s*pepper/.test(
      name,
    ) ||
    /pepper\s+flakes/.test(name) ||
    /\bcayenne\b/.test(name) ||
    /\bonion\s+powder\b/.test(name) ||
    /\bred\s+pepper\s+flakes\b/.test(name) ||
    /\bchili\s+pepper\s+flakes\b/.test(name) ||
    /\bpepperoncini\b/.test(name)
  );
}

/**
 * Strip price tags, duplicate metric conversions, and dual-measure prefixes from names.
 * @param {{ amount: string, unit: string, name: string }} ing
 */
export function cleanIngredientNameFields(ing) {
  let { amount, unit, name } = ing;
  let n = (name || '').trim();
  if (!n) return { amount, unit, name: n };

  n = n.replace(/\s*\(\$[\d.]+(?:\*)?\)/gi, '').trim();
  n = n.replace(/\s{2,}/g, ' ');

  const canonical = normalizeIngredientUnit(unit);
  const usUnits = new Set(['tsp', 'Tbsp', 'cup', 'oz', 'lb', 'L']);

  const dualPrefix = n.match(/^\(([^)]+)\)\s+(.+)$/);
  if (dualPrefix && !amount) {
    const segments = dualPrefix[1].split(/[;,]/).map((s) => s.trim());
    const usSegment =
      segments.find((s) => /\b(cup|cups|tbsp|tsp|oz|lb)\b/i.test(s)) ?? segments[0];
    const reparsed = parseIngredientLineRich(`${usSegment} ${dualPrefix[2]}`);
    if (reparsed.name) {
      amount = reparsed.amount || amount;
      unit = reparsed.unit ? normalizeIngredientUnit(reparsed.unit) || reparsed.unit : unit;
      n = reparsed.name;
    }
  }

  const leadingMetric = n.match(/^\((\d+(?:\.\d+)?)\s*(ml|g|kg|oz|lb)\)\s*/i);
  if (leadingMetric) {
    if (canonical && usUnits.has(canonical)) {
      n = n.slice(leadingMetric[0].length).trim();
    } else if (!amount) {
      amount = leadingMetric[1];
      unit = normalizeIngredientUnit(leadingMetric[2]) || leadingMetric[2];
      n = n.slice(leadingMetric[0].length).trim();
    }
  }

  const trailingWeight = n.match(/^(.+?)[,\s]+\((\d+(?:\.\d+)?)\s*(g|kg|oz|lb)\)\s*$/i);
  if (trailingWeight) {
    if (!amount) {
      amount = trailingWeight[2];
      unit = normalizeIngredientUnit(trailingWeight[3]) || trailingWeight[3];
      n = trailingWeight[1].trim();
    } else if (canonical && usUnits.has(canonical)) {
      n = trailingWeight[1].trim();
    }
  }

  const stickNote = n.match(/^\((\d+\s*sticks?)\)\s*/i);
  if (stickNote && canonical === 'Tbsp') {
    n = `${n.slice(stickNote[0].length).trim()} (${stickNote[1]})`;
  }

  n = n.replace(/\s{2,}/g, ' ').replace(/,\s*,/g, ',').trim();
  return { amount, unit, name: n };
}

export function isGarnishSectionHeader(line) {
  return /recommended\s+garnish|^\s*garnish(es)?\s*$/i.test(line.trim());
}

/** Prefer the US-friendly measure when a line lists grams then "or …". */
export function preferUsMeasureText(text) {
  let t = text.trim();
  const dualGram = t.match(/^(\d+(?:\.\d+)?)\s*g\s+or\s+(.+)$/i);
  if (dualGram) t = dualGram[2].trim();
  t = t.replace(/(\d)([Tt]bsp|[Tt]sp)/g, '$1 $2');
  t = t.replace(/(\d+(?:\.\d+)?)(liters?|milliliters?|ml)\b/gi, '$1 $2');
  t = t.replace(/\b(lrg)\b/gi, 'large');
  return t;
}

/**
 * @param {string} line
 * @returns {{ amount: string, unit: string, name: string }}
 */
export function parseIngredientLineRich(line) {
  const text = preferUsMeasureText(
    line.replace(/^[▪•·🔹🍅📌\-]\s*/, '').trim(),
  );
  if (!text) return { amount: '', unit: '', name: '' };

  const countFirst = text.match(/^(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)\s+(.+)$/);
  if (countFirst) {
    const amount = countFirst[1].trim();
    const rest = countFirst[2].trim();
    const unitMatch = rest.match(
      /^((?:\d+(?:\.\d+)?\s*)?(?:oz|lb|g|kg|ml|l|liters?|Tbsp|tbsp|tsp|cups?|cans?|cloves?|pieces?|large)\b\.?)\s+(.+)$/i,
    );
    if (unitMatch) {
      return {
        amount,
        unit: unitMatch[1].trim(),
        name: unitMatch[2].trim(),
      };
    }
    return { amount, unit: '', name: rest };
  }

  const measureFirst = text.match(
    /^(\d+(?:\.\d+)?)\s+((?:\d+(?:\.\d+)?\s*)?(?:oz|lb|g|kg|ml|l|liters?|Tbsp|tbsp|tsp|cups?|cans?)\b\.?)\s+(.+)$/i,
  );
  if (measureFirst) {
    return {
      amount: measureFirst[1].trim(),
      unit: measureFirst[2].trim(),
      name: measureFirst[3].trim(),
    };
  }

  return { amount: '', unit: '', name: text };
}

/**
 * @param {{ amount: string, unit: string, name: string, group?: string }[]} ingredients
 * @param {string} [title]
 */
export function prioritizeMainIngredient(ingredients, title = '') {
  const titleLower = title.toLowerCase();
  const protein =
    MAIN_PROTEINS.find((p) => titleLower.includes(p)) ??
    MAIN_PROTEINS.find((p) =>
      ingredients.some((i) => i.name.toLowerCase().includes(p)),
    );
  if (!protein) return ingredients;

  const idx = ingredients.findIndex(
    (i) => !i.group && i.name.toLowerCase().includes(protein),
  );
  if (idx <= 0) return ingredients;

  const copy = [...ingredients];
  const [main] = copy.splice(idx, 1);
  return [main, ...copy];
}

/**
 * @param {{ amount: string, unit: string, name: string, group?: string }[]} ingredients
 * @param {{ title?: string }} [options]
 */
export function normalizeCatalogIngredients(ingredients, options = {}) {
  const steps = options.steps ?? [];
  const filtered = ingredients
    .map((ing) => {
      const parsed =
        ing.amount || ing.unit
          ? ing
          : { ...parseIngredientLineRich(ing.name), group: ing.group };
      if (isJunkIngredientName(parsed.name)) return null;
      if (isImplicitSaltPepper(parsed.name)) return null;
      return repairIngredientFields({ ...parsed, group: ing.group }, steps);
    })
    .filter(Boolean);

  const ordered = prioritizeMainIngredient(filtered, options.title ?? '');
  const grouped = inferIngredientGroups(ordered, steps);
  const expanded = expandOliveOilForSauceAndVeggies(grouped, steps);
  return orderIngredientSections(expanded);
}

/**
 * When a whisk step uses oil in the sauce and a later step adds more for vegetables,
 * ensure both amounts exist as separate lines.
 * @param {{ amount: string, unit: string, name: string, group?: string }[]} ingredients
 * @param {string[]} steps
 */
function expandOliveOilForSauceAndVeggies(ingredients, steps) {
  const whisk = steps.find((s) => /whisk/i.test(s));
  const veg = steps.find((s) => /vegetable|broccoli|sweet potato|toss.*oil/i.test(s));
  if (!whisk || !veg) return ingredients;

  const sauceOilMatch = whisk.match(
    /(\d+(?:\.\d+)?)\s+tablespoons?\s+olive\s+oil/i,
  );
  const vegOilMatch = veg.match(/(\d+(?:\.\d+)?)\s+tablespoons?\s+olive\s+oil/i);
  if (!sauceOilMatch || !vegOilMatch) return ingredients;

  const oils = ingredients.filter((i) => /olive\s+oil/i.test(i.name));
  if (oils.length !== 1) return ingredients;

  const sauceLabel = sauceGroupLabel(whisk);
  const withoutOil = ingredients.filter((i) => !/olive\s+oil/i.test(i.name));
  const sauceOil = {
    amount: sauceOilMatch[1],
    unit: 'Tbsp',
    name: 'olive oil',
    group: sauceLabel,
  };
  const vegOil = {
    amount: vegOilMatch[1],
    unit: 'Tbsp',
    name: 'olive oil',
    group: 'Vegetables',
  };

  const out = [];
  let addedSauceOil = false;
  let addedVegOil = false;
  for (const ing of withoutOil) {
    out.push(ing);
    if (ing.group === sauceLabel && !addedSauceOil) {
      out.push(sauceOil);
      addedSauceOil = true;
    }
    if (ing.group === 'Vegetables' && !addedVegOil) {
      out.push(vegOil);
      addedVegOil = true;
    }
  }
  if (!addedSauceOil) {
    const lastSauce = out.reduce(
      (idx, ing, i) => (ing.group === sauceLabel ? i : idx),
      -1,
    );
    out.splice(lastSauce + 1, 0, sauceOil);
  }
  if (!addedVegOil) {
    const lastVeg = out.reduce(
      (idx, ing, i) => (ing.group === 'Vegetables' ? i : idx),
      -1,
    );
    out.splice(lastVeg + 1, 0, vegOil);
  }
  return out;
}
