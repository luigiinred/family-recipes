---
name: recipes-enrich-from-url
description: Scrape non-YouTube sourceUrl into the catalog (JSON-LD/HTML parser or browser). Subskill of recipes-import-recipe — use the parent skill first to route YouTube vs web. Use for blog/recipe-site URLs with empty ingredients or placeholder steps.
---

# Enrich recipes from source URLs (non-YouTube)

Replace placeholder `steps` / empty `ingredients` by reading each recipe's `sourceUrl`.

> **Parent skill:** **recipes-import-recipe** — use that to add recipes and to route YouTube URLs to **recipes-youtube-recipe** instead of this skill.

## When to use

- `sourceUrl` is **not** YouTube (for YouTube, use **recipes-youtube-recipe**)
- `steps` contain "See source" or `ingredients` is `[]`
- Batch refresh after source sites change

## Site-specific importers

| Site | Command |
| ---- | ------- |
| [byonandlara.com/recipes](http://www.byonandlara.com/recipes/) | `npm run import:byonandlara` |

Parser: `scripts/lib/parse-byonandlara.mjs` — index `?recipe_id=` links, detail `<ul>` / `<ol>` lists.

## Pipeline (try in order)

### 1. Batch script (default)

```bash
npm run enrich:catalog
node scripts/enrich-catalog-from-urls.mjs --slug=briam
node scripts/enrich-catalog-from-urls.mjs --dry-run
```

- Parser: `scripts/lib/parse-recipe-html.mjs`
  - `application/ld+json` Recipe nodes
  - Inline `"@type":"Recipe"` JSON (Eatwell101)
  - `recipeIngredient` as array **or** object with numeric keys
  - HTML section fallback for Ingredients / Instructions
- Writes `src/static-api/data/recipes.json`, `public/data/recipes.json`
- Audit: `src/static-api/data/enrichments/<slug>.json`
- After run: `npm run test:run` (at least `catalog.test.ts`)

### 2. Cursor browser (when script fails)

Use **cursor-ide-browser** when fetch returns errors, empty parse, redirects to non-recipe pages, or CAPTCHA.

#### Lock workflow

1. `browser_navigate` → `sourceUrl` (use `newTab: true` if tab state is stale)
2. Wait for recipe content (title + ingredient list visible)
3. `browser_snapshot` — extract:
   - **Ingredients**: list items under Ingredients heading
   - **Steps**: numbered instructions
   - **imageUrl**: hero image `src` or page `og:image` (absolute `https://`)
   - **prepMinutes / cookMinutes / servings** when shown
4. Update catalog entry (keep `id`, `mealLists`, `tags`, `notes`, `sourceUrl`)
5. Save audit JSON under `src/static-api/data/enrichments/<slug>.json` with `{ "method": "browser", "scrapedAt": "ISO" }`
6. `browser_unlock` when done with all URLs

#### Browser rules

- Copy ingredient lines from the page; do not invent items
- One string per numbered step; remove "See source" placeholders
- If URL 404 or redirects to wrong article, search for the correct recipe URL, update `sourceUrl` in `scripts/build-recipes-catalog.mjs` and `recipes.json`, then retry
- Document URL fixes in `notes` on the recipe (e.g. ketofy.me → ketopots.com)

### 3. Manual patch (last resort)

`scripts/patch-keto-tilapia.mjs` is an example. For one-off failures:

```bash
node scripts/patch-keto-tilapia.mjs   # or copy pattern into scripts/patch-<slug>.mjs
```

Use `scripts/lib/patch-recipe.mjs` → `patchRecipe(slug, { ingredients, steps, imageUrl, ... })`.

## Known URL fixes

| Slug | Issue | Use instead |
| ---- | ----- | ----------- |
| `slow-cooker-lemon-garlic-chicken` | Old Kitchn ID redirects to unrelated article | `https://www.thekitchn.com/recipe-slow-cooker-lemon-garlic-chicken-breast-249436` |
| `greek-chicken-slow-cooker` | 404 on `/greek-chicken-slow-cooker/` | `https://www.daringgourmet.com/slow-cooker-greek-chicken/` |
| `keto-fried-tilapia-lemon-garlic-butter` | ketofy.me redirects | `https://ketopots.com/keto-tilapia/` (note on recipe) |

## Ingredient sections & cleanup (required)

After parse (or before marking a row done), run through **`normalizeCatalogIngredients()`** in `scripts/lib/ingredient-lines.mjs` (or `npm run normalize:ingredients`).

| Rule | Detail |
| ---- | ------ |
| **Broken fractions** | `/2` → `1/2`, `/4` → `1/4` (Eatwell101 JSON-LD often drops the `1`) |
| **Units in the right field** | Never `unit: "tablespoon", name: "honey"` — use `amount` + canonical `unit` (`Tbsp`, `tsp`, `cup`) + lowercase `name` |
| **Section `group`** | Consecutive ingredients with the same `group` render as labeled blocks on recipe detail |
| **Sauce / whisk step** | Ingredients in a “whisk together …” step → `group: "Chili-lime sauce"` (or Marinade / Dressing / Sauce from context) |
| **Garnishes** | Lines with “for garnish” or under a Garnishes heading → `group: "Garnishes"` |
| **Vegetables** | Second oil for sheet-pan veg → `group: "Vegetables"`; split duplicate olive oil when sauce + veg each need their own `Tbsp` line |
| **Page headings** | Parser maps `For the sauce`, `Recommended garnishes`, etc. to `group` when HTML provides sections |

See **`docs/api-specs/data/ingredient-units.md`** for canonical units and display rules.

## Notes vs steps (required)

Cookbook **notes** are not cooking steps. After scraping, run **`npm run normalize:notes`** or use `applyRecipeNotes()` in `scripts/lib/recipe-notes.mjs`.

### Scan the source for notes

| Source | Where to look |
| ------ | ------------- |
| **Blog HTML** | `.recipe-notes`, tip boxes, paragraphs starting with `Note:` after the instructions list |
| **JSON-LD** | Sometimes the last `recipeInstructions` item is a note, not a step |
| **YouTube description** | `NOTE:`, `TIPS:`, `Pro tip` blocks below the ingredient list (before chapters/affiliate links) |
| **Video** | Spoken asides (“make sure you use non-stick”) — capture in `notes` when rewriting steps |

### Move to `notes` (remove from `steps`)

- Lines starting with **`Note:`**, **`Notes:`**, **`Tip:`**, **`Chef's note`**
- **`Recipe Notes`** header-only rows (merge body from the page into `notes`)
- Meta lines: storage, leftovers, make-ahead, substitutions, affiliate disclaimers
- Commentary that is not an imperative cooking action (e.g. “tilapia can taste muddy — season boldly”)

### Keep in `steps`

- Imperative instructions: *Preheat*, *Whisk*, *Bake until*
- **Serve** as a **separate** step only when it adds finishing detail (named garnishes, sauces on top, how to plate) — not *Serve hot* / *Enjoy!* glued onto the bake line
- YouTube **timed** steps — notes must not appear in `timedSteps`

Helpers:

| Helper | Module |
| ------ | ------ |
| Notes vs steps | `isRecipeNoteStep()`, `splitStepsAndNotes()`, `applyRecipeNotes()` — `recipe-notes.mjs` |
| Split bake + serve | `splitBakeAndServeStep()`, `polishRecipeSteps()` — `recipe-steps.mjs` |

Example (Eatwell101 tilapia):

| Bad (one step) | Good (two steps) |
| -------------- | ---------------- |
| Bake until done… **Serve** garnished with cilantro… **Enjoy!** | 1. Bake until fish flakes… 2. Serve garnished with cilantro, chili peppers, and lime wedges. |

## Catalog checklist (per slug)

- [ ] `ingredients.length > 0`
- [ ] No broken amounts (`/2`), no measure words stuck in `unit` with empty `amount`
- [ ] No dual measures in `name` (e.g. `(60ml)` next to `cup`, or `(700g)` next to `lb`) — pick US-friendly amount in `amount`/`unit` only
- [ ] No salt, kosher salt, or table black/white pepper lines — season in `steps` instead
- [ ] Sauce/marinade and garnish ingredients use `group` where the recipe has those sections
- [ ] `steps.length > 0`, no "see source" text; no `Note:` / tip lines left in `steps` (use `notes`)
- [ ] Cook steps do not include trailing **Serve… Enjoy!** — split or drop per `recipe-steps.mjs`
- [ ] `notes` holds sidebar tips from page or video description when present
- [ ] `imageUrl` set when the page provides one
- [ ] `sourceUrl` resolves to the actual recipe page
- [ ] Enrichment audit file exists
- [ ] `npm run test:run` — `catalog.test.ts` green

## Failures log

Append to `src/static-api/data/enrichments/_failures.json`:

```json
{ "slug": "reason", "failedAt": "2026-05-25T..." }
```

Retry failed slugs with the browser method.

## Related

- **recipes-import-recipe** — main add/import workflow
- **recipes-youtube-recipe** — YouTube URLs
- **recipes-static-api** — catalog shape
- **api-specs** — loader contracts
- `docs/api-specs/loaders/recipes-catalog.md`
