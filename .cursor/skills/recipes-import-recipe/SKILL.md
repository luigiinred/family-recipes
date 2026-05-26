---
name: recipes-import-recipe
description: >-
  Add or refresh a recipe in the static catalog from a URL. Simplifies noisy
  titles, always fetches ingredients/steps/images from the source, and delegates
  to recipes-youtube-recipe when sourceUrl is YouTube. Use when the user asks to
  add a recipe, import from a link, or fill the database from a bookmark.
---

# Import recipe to catalog

**Entry point** for adding recipes to `src/static-api/data/recipes.json`. Always pull full data from `sourceUrl` before considering the row done.

## When to use

- User shares a recipe URL or asks to add/import/save a recipe
- New row in the catalog with empty `ingredients` or placeholder steps
- Batch refresh after imports

## Route by URL type

| `sourceUrl` | Skill / command |
| ----------- | ---------------- |
| `youtube.com`, `youtu.be`, `/shorts/` | **recipes-youtube-recipe** (subskill) — timed steps + description/blog ingredients |
| Any other HTTP(S) recipe page | **recipes-enrich-from-url** — JSON-LD / HTML parser |
| byonandlara.com index | `npm run import:byonandlara` |

**Always start here.** Do not hand-edit catalog rows without running the matching import/enrich command.

## Title rule (required)

Source titles are often full YouTube headlines. **Never** copy them verbatim into `title`.

Use `simplifyRecipeTitle()` from `scripts/lib/simplify-recipe-title.mjs`:

| Raw | Catalog `title` |
| --- | ----------------- |
| `25 MIN CHICKEN TORTILLA SOUP (So Much Better…) \| Weeknighting` | `Chicken Tortilla Soup` |
| `Easy 20 Minute Mediterranean Orzo Salad \| Channel` | `Mediterranean Orzo Salad` |

Strips: leading durations, parenthetical clickbait, pipe channel suffixes; title-cases shouty ALL CAPS.

Import scripts apply this automatically (`displayTitleFromYouTube` for YouTube). When patching by hand, run the same helper.

## Completion checklist (every import)

- [ ] `title` is short cookbook-style (see above)
- [ ] `ingredients.length > 0` (from page JSON-LD, blog link, or YouTube `RECIPE` block in description)
- [ ] `steps` are **full instructions** you can cook from without the video (see **recipes-youtube-recipe** — not chapter titles like `Salad prep`)
- [ ] `steps.length > 0` with no "see source" / "watch full recipe" placeholders
- [ ] `imageUrl` set when the source provides one
- [ ] `sourceUrl` is the canonical recipe or watch URL
- [ ] Audit file: `src/static-api/data/enrichments/<slug>.json`
- [ ] `npm run sync:recipes-data` then `npm run test:run`

## YouTube (subskill)

Follow **recipes-youtube-recipe** end-to-end:

```bash
# Single video
npm run import:youtube-playlist -- --url='https://www.youtube.com/watch?v=VIDEO_ID'

# Fix existing rows (titles, ingredients, timed steps)
npm run refresh:youtube-recipes
npm run refresh:youtube-recipes -- --slug=yt-...
```

Ingredients order: companion blog URL in description → inline `RECIPE` block in description → fail and use browser fallback (document in enrichments audit).

## Non-YouTube sites

Follow **recipes-enrich-from-url**:

```bash
npm run enrich:catalog
node scripts/enrich-catalog-from-urls.mjs --slug=my-recipe
```

If fetch/parse fails, use cursor-ide-browser per that skill — still copy real ingredient lines from the page.

## Add a new catalog row (manual outline)

1. Choose `slug` (`yt-` prefix for YouTube imports from scripts)
2. Set `sourceUrl`, `mealLists` (default `to-make` for imports), minimal tags
3. Run the correct command above — **do not** leave `ingredients: []`
4. Sync + tests

## Related

- **recipes-youtube-recipe** — video id, `timedSteps`, embed UI
- **recipes-enrich-from-url** — scrape non-YouTube `sourceUrl`
- **recipes-static-api** — schema and loaders
- **AGENTS.md** — skill index
