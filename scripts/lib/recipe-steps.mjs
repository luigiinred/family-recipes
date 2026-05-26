/**
 * Polish imported instruction steps: split bake/cook from serve, drop empty fluff.
 */

const SERVE_TAIL =
  /\.\s+(Serve\b[\s\S]*?)(?:\s*Enjoy!\s*)?$/i;

const FLUFF_ONLY = /^(?:Enjoy!?|Bon appetit!?|Dig in!?)\s*\.?$/i;

/**
 * Serve step is worth keeping only when it names how to finish the plate.
 * @param {string} serveClause — text starting with "Serve"
 */
export function isSubstantiveServeStep(serveClause) {
  const body = serveClause
    .replace(/^Serve\b/i, '')
    .replace(/\s*if desired\.?\s*$/i, '')
    .trim();
  if (!body) return false;
  if (FLUFF_ONLY.test(body)) return false;
  return /garnish|topped|sprinkle|drizzle|alongside|over\s+|with\s+(?:the\s+)?[a-z]/i.test(
    body,
  );
}

/**
 * Split "Bake until … Serve with … Enjoy!" into cook + optional serve steps.
 * @param {string} text
 * @returns {string[]}
 */
export function splitBakeAndServeStep(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return [];

  const m = trimmed.match(SERVE_TAIL);
  if (!m) {
    return [stripStepFluff(trimmed)].filter(Boolean);
  }

  const cook = stripStepFluff(trimmed.slice(0, m.index + 1).trim());
  let serve = m[1].trim().replace(/\s*Enjoy!\s*$/i, '').trim();
  if (!serve.endsWith('.')) serve += '.';

  const steps = cook ? [cook] : [];
  if (isSubstantiveServeStep(serve)) {
    steps.push(serve);
  }
  return steps;
}

/**
 * @param {string} text
 */
export function stripStepFluff(text) {
  return (text || '')
    .trim()
    .replace(/\s*Enjoy!\s*$/i, '')
    .replace(/\s*Bon appetit!?\s*$/i, '')
    .trim();
}

/**
 * @param {string[]} steps
 */
export function polishRecipeSteps(steps) {
  const out = [];
  for (const step of steps || []) {
    const split = splitBakeAndServeStep(step);
    if (split.length) out.push(...split);
  }
  return out.filter((s) => s.length > 8 && !FLUFF_ONLY.test(s));
}
