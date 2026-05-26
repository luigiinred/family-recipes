#!/usr/bin/env node
/**
 * Re-extract timed steps and blog ingredients for all YouTube recipes in the catalog.
 *
 *   npm run refresh:youtube-recipes
 *   npm run refresh:youtube-recipes -- --slug=yt-25-min-chicken-tortilla-soup-...
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  dumpVideoJson,
  extractTimedSteps,
  pickBetterTimedSteps,
} from './lib/fetch-youtube-timed-steps.mjs';
import { parseRecipeHtml } from './lib/parse-recipe-html.mjs';
import {
  displayTitleFromYouTube,
  ingredientsFromYouTubeDescription,
  primaryRecipeUrlFromDescription,
} from './lib/youtube-recipe-fields.mjs';
import { resolveYouTubeTimedSteps } from './lib/youtube-instruction-steps.mjs';
import { isTableOfContentsSteps } from './lib/youtube-toc-steps.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/static-api/data/recipes.json');
const enrichDir = join(root, 'src/static-api/data/enrichments');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

function readArg(name) {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

const dryRun = process.argv.includes('--dry-run');
const slugFilter = readArg('slug');
const cookiesBrowser = readArg('cookies-from-browser');
const moveToMake = !process.argv.includes('--no-move-to-make');

async function resolveUrl(url) {
  const res = await fetch(url, {
    method: 'HEAD',
    headers: { 'User-Agent': UA },
    redirect: 'follow',
  });
  return res.url || url;
}

async function fetchBlogFields(url) {
  if (!url) return null;
  try {
    const resolved = await resolveUrl(url);
    const res = await fetch(resolved, {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    return parseRecipeHtml(await res.text());
  } catch {
    return null;
  }
}

function syncSteps(recipe, timedSteps) {
  recipe.timedSteps = timedSteps;
  recipe.steps = timedSteps.map((s) => s.text);
}

async function main() {
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  let targets = catalog.recipes.filter(
    (r) => r.recipeKind === 'youtube' && r.youtubeVideoId,
  );
  if (slugFilter) {
    targets = targets.filter((r) => r.slug === slugFilter);
  }

  const report = { refreshed: [], skipped: [], failed: [] };

  for (const recipe of targets) {
    const id = recipe.youtubeVideoId;
    console.log(`\n${recipe.slug} (${id})`);

    try {
      const meta = dumpVideoJson(id, cookiesBrowser);
      const extracted = extractTimedSteps(meta, cookiesBrowser);
      const { inlineRecipe } = extracted;

      const blogUrl = primaryRecipeUrlFromDescription(meta.description);
      const blog = await fetchBlogFields(blogUrl);

      const resolved = resolveYouTubeTimedSteps({ blog, meta, extracted });
      let stepSource = resolved.source;

      if (!resolved.timedSteps.length) {
        report.failed.push({ slug: recipe.slug, reason: 'no timed steps extracted' });
        console.log('  ✗ no steps');
        continue;
      }

      if (resolved.source === 'blog-chapters') {
        syncSteps(recipe, resolved.timedSteps);
        console.log(`  ✓ ${resolved.timedSteps.length} steps (${stepSource})`);
      } else {
        const best = pickBetterTimedSteps(recipe.timedSteps, resolved.timedSteps);
        if (best !== recipe.timedSteps) {
          syncSteps(recipe, best);
          console.log(`  ✓ ${best.length} steps (${stepSource})`);
        } else if (isTableOfContentsSteps(recipe.timedSteps)) {
          console.log('  ⚠ still table-of-contents steps — add blog link or write steps manually');
        } else {
          console.log('  ⚠ kept existing steps (new extract not better)');
        }
      }

      const simplified = displayTitleFromYouTube(meta.title);
      if (
        simplified &&
        simplified !== recipe.title &&
        !recipe.slug.startsWith('bean-')
      ) {
        recipe.title = simplified;
        console.log(`  ✓ title → ${simplified}`);
      }
      if (blog?.ingredients?.length) {
        recipe.ingredients = blog.ingredients;
        if (blog.description?.length > 40) {
          recipe.description = blog.description.slice(0, 500);
        }
        recipe.prepMinutes = blog.prepMinutes || recipe.prepMinutes;
        recipe.cookMinutes = blog.cookMinutes || recipe.cookMinutes;
        recipe.servings = blog.servings || recipe.servings;
        if (blog.imageUrl) recipe.imageUrl = blog.imageUrl;
        console.log(`  ✓ ${blog.ingredients.length} ingredients from blog`);
      } else {
        const descIngredients = ingredientsFromYouTubeDescription(meta.description);
        if (descIngredients.length) {
          recipe.ingredients = descIngredients;
          console.log(`  ✓ ${descIngredients.length} ingredients from description`);
        } else if (inlineRecipe?.ingredients?.length) {
          recipe.ingredients = inlineRecipe.ingredients;
          console.log(`  ✓ ${inlineRecipe.ingredients.length} ingredients from description`);
        } else {
          console.log('  ⚠ no ingredients (no blog link found)');
        }
      }

      if (moveToMake) {
        const lists = new Set(recipe.mealLists || []);
        lists.delete('saved');
        lists.add('to-make');
        recipe.mealLists = [...lists];
      }

      if (!dryRun) {
        mkdirSync(enrichDir, { recursive: true });
        writeFileSync(
          join(enrichDir, `${recipe.slug}.json`),
          JSON.stringify(
            {
              method: 'youtube-refresh',
              scrapedAt: new Date().toISOString(),
              videoId: id,
              stepSource,
              blogUrl: blogUrl || null,
            },
            null,
            2,
          ) + '\n',
        );
      }

      report.refreshed.push(recipe.slug);
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      report.failed.push({ slug: recipe.slug, reason: err.message });
      console.log(`  ✗ ${err.message}`);
    }
  }

  if (!dryRun) {
    const json = JSON.stringify(catalog, null, 2) + '\n';
    writeFileSync(catalogPath, json);
    writeFileSync(join(root, 'public/data/recipes.json'), json);
  }

  console.log('\n---');
  console.log(`Refreshed: ${report.refreshed.length}`);
  if (report.failed.length) console.log('Failed:', report.failed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
