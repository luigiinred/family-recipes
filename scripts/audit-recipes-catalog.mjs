#!/usr/bin/env node
/**
 * Audit catalog recipes against recipes-import-recipe / recipes-youtube-recipe / recipes-enrich-from-url checklists.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { simplifyRecipeTitle } from './lib/simplify-recipe-title.mjs';
import { isTableOfContentsSteps } from './lib/youtube-toc-steps.mjs';
import { isLowQualityTimedSteps } from './lib/fetch-youtube-timed-steps.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/static-api/data/recipes.json');
const enrichDir = join(root, 'src/static-api/data/enrichments');

const MEASURE_UNITS = new Set([
  'tsp',
  'Tbsp',
  'cup',
  'L',
  'ml',
  'oz',
  'lb',
  'g',
  'kg',
  'can',
  'clove',
  'cloves',
  'pinch',
  '',
]);

const PLACEHOLDER_STEP = /see source|watch full recipe|watch the video/i;
const YOUTUBE_URL = /youtube\.com|youtu\.be/i;
const USES_PREFIX = /^Uses:\s+/;
const IMPERATIVE = /^(preheat|add|stir|mix|simmer|bake|roast|whisk|serve|combine|heat|drain|season|cover|chop|dice|slice|toss|pour|blend|cook|place|spread|reduce|remove|transfer|arrange|top|garnish|let|bring|set|make|fill|roll|fold|crush|mince|grate|zest|juice|pat|sear|sauté|saute)/i;
const BAD_INGREDIENT = /#\w+|bensound|subscribe|affiliate|music by/i;
const TITLE_NOISE = /\|\s*.+$|^\d+\s*(-|\s)?\s*(min|minute|hour)/i;

const CRITICAL_ONLY = process.argv.includes('--critical');

/** @param {import('../src/static-api/types/recipe.ts').Recipe} recipe */
function auditRecipe(recipe) {
  const issues = [];
  const slug = recipe.slug;
  const isYoutube =
    recipe.recipeKind === 'youtube' || YOUTUBE_URL.test(recipe.sourceUrl ?? '');
  const hasSource = Boolean(recipe.sourceUrl?.trim());

  // --- Universal import checklist ---
  if (!recipe.title?.trim()) issues.push('missing title');
  if (hasSource && TITLE_NOISE.test(recipe.title)) {
    const simplified = simplifyRecipeTitle(recipe.title);
    if (simplified !== recipe.title) {
      issues.push(`title not simplified (suggest: "${simplified}")`);
    }
  }
  if (!recipe.mealTypes?.length) issues.push('missing mealTypes');
  if (recipe.ingredients.length === 0) issues.push('empty ingredients');
  if (recipe.steps.length === 0) issues.push('empty steps');
  if (recipe.steps.some((s) => PLACEHOLDER_STEP.test(s))) issues.push('placeholder steps');
  if (hasSource && !existsSync(join(enrichDir, `${slug}.json`))) {
    issues.push('missing enrichments audit file');
  }

  // --- Ingredients quality ---
  for (const ing of recipe.ingredients) {
    const line = `${ing.amount} ${ing.unit} ${ing.name}`;
    if (BAD_INGREDIENT.test(line)) issues.push(`bad ingredient line: ${ing.name.slice(0, 40)}`);
    if (
      !CRITICAL_ONLY &&
      ing.unit &&
      !MEASURE_UNITS.has(ing.unit) &&
      !['fresh', 'anchovy', 'cups', 'large', 'medium', 'pieces', '28oz'].includes(ing.unit)
    ) {
      issues.push(`non-canonical unit "${ing.unit}" on ${ing.name.slice(0, 30)}`);
    }
    if (ing.unit && ing.unit !== ing.unit && /^(TBSP|TSP|Cups|Tablespoon)/.test(ing.unit)) {
      issues.push(`wrong unit casing: ${ing.unit}`);
    }
    if (ing.name && /^[A-Z]/.test(ing.name) && !/^[A-Z][a-z]+ [A-Z]/.test(ing.name)) {
      // Title-case single word like "Olive Oil"
      if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(ing.name.trim())) {
        issues.push(`title-case ingredient name: ${ing.name.slice(0, 40)}`);
      }
    }
    if (!CRITICAL_ONLY && /\(\d+\s*(?:ml|g|kg)\)/i.test(ing.name)) {
      issues.push(`embedded metric in name: ${ing.name.slice(0, 40)}`);
    }
    if (
      !CRITICAL_ONLY &&
      /^(kosher\s+)?salt(\s+and|\s*&|\s*,|\s+to\s+taste)/i.test(ing.name.trim())
    ) {
      issues.push(`salt/pepper should not be listed: ${ing.name.slice(0, 40)}`);
    }
    if (!CRITICAL_ONLY && /\(\$[\d.]+\)/.test(ing.name)) {
      issues.push(`price in name: ${ing.name.slice(0, 40)}`);
    }
    if (!CRITICAL_ONLY && ing.amount && /^\/\d/.test(ing.amount)) {
      issues.push(`broken amount "${ing.amount}" on ${ing.name.slice(0, 30)}`);
    }
  }

  // --- YouTube-specific ---
  if (isYoutube) {
    if (recipe.recipeKind !== 'youtube') issues.push('YouTube sourceUrl but recipeKind !== youtube');
    if (!recipe.youtubeVideoId || recipe.youtubeVideoId.length !== 11) {
      issues.push('missing or invalid youtubeVideoId');
    }
    if (!recipe.timedSteps?.length) issues.push('empty timedSteps');
    else {
      if (isLowQualityTimedSteps(recipe.timedSteps)) issues.push('low-quality timedSteps');
      if (isTableOfContentsSteps(recipe.timedSteps)) issues.push('TOC-style timedSteps');
      const texts = recipe.timedSteps.map((s) => s.text);
      if (JSON.stringify(recipe.steps) !== JSON.stringify(texts)) {
        issues.push('steps !== timedSteps text');
      }
      for (const s of recipe.timedSteps) {
        if (!USES_PREFIX.test(s.text)) issues.push('step missing Uses: line');
        else {
          const parts = s.text.split(/\n\n/);
          const instruction = parts.slice(1).join('\n\n').trim() || parts[0].replace(/^Uses:[^\n]+\n?/, '').trim();
          if (instruction && !IMPERATIVE.test(instruction)) {
            issues.push(`instruction may not be imperative: "${instruction.slice(0, 50)}…"`);
          }
        }
        if (s.text.length < 40 && !USES_PREFIX.test(s.text)) {
          issues.push(`short step text (${s.text.length} chars)`);
        }
      }
      let prev = -1;
      for (const s of recipe.timedSteps) {
        if (s.startSeconds < prev) issues.push('timedSteps startSeconds not non-decreasing');
        prev = s.startSeconds;
      }
    }
    const expectedThumb = recipe.youtubeVideoId
      ? `https://i.ytimg.com/vi/${recipe.youtubeVideoId}/hqdefault.jpg`
      : null;
    if (expectedThumb && recipe.imageUrl && !recipe.imageUrl.includes('ytimg.com') && !recipe.imageUrl.includes('i.ytimg')) {
      issues.push('custom imageUrl (ok) or missing yt thumb');
    }
  } else if (hasSource) {
    // Non-YouTube: steps don't require Uses: but should be cookable
    for (const s of recipe.steps) {
      if (s.length < 20) issues.push(`very short step: "${s.slice(0, 40)}"`);
    }
  }

  return issues;
}

const { recipes } = JSON.parse(readFileSync(catalogPath, 'utf8'));
const results = recipes.map((r) => ({ slug: r.slug, title: r.title, issues: auditRecipe(r) }));
const failing = results.filter((r) => r.issues.length > 0);

console.log(JSON.stringify({ total: recipes.length, failing: failing.length, recipes: failing }, null, 2));
