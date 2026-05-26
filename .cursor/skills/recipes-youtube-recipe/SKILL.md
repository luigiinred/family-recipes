---
name: recipes-youtube-recipe
description: >-
  Subskill of recipes-import-recipe for YouTube URLs. Timestamped video recipes,
  simplified titles, ingredients from description RECIPE blocks or linked blogs.
  Use when sourceUrl is youtube.com or youtu.be — not as the top-level import entry.
---

# YouTube video recipes

**Subskill of recipes-import-recipe.** The parent skill routes here for YouTube `sourceUrl`; do not import YouTube rows without following both skills.

Add recipes sourced from **YouTube videos** with **clickable steps** that seek the embedded player.

## When to use

- **recipes-import-recipe** routed a YouTube URL here
- `sourceUrl` matches `youtube.com/watch`, `youtu.be/`, or `/shorts/`
- Steps should jump to moments in the video on the recipe detail page

## Title + ingredients (required)

- **Title:** `displayTitleFromYouTube()` / `simplifyRecipeTitle()` — short name only (e.g. `Chicken Tortilla Soup`), never the full video headline
- **Ingredients:** always fill before done — `ingredientsFromYouTubeDescription()` for `RECIPE` blocks in the description, then `primaryRecipeUrlFromDescription()` + `parseRecipeHtml` for linked blogs

## Catalog shape

```json
{
  "recipeKind": "youtube",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "sourceUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "timedSteps": [
    { "text": "Prep vegetables", "startSeconds": 45 },
    { "text": "Roast in the oven", "startSeconds": 312 }
  ],
  "steps": ["Prep vegetables", "Roast in the oven"]
}
```

- `recipeKind` must be `"youtube"`.
- `youtubeVideoId` — 11-character id from the URL (see `parseYouTubeVideoId` in `src/lib/youtube/parseYouTubeVideoId.ts`).
- `timedSteps` — source of truth for timestamps; keep `steps` as the same texts (for search, print, loaders).
- All other `Recipe` fields (`ingredients`, `tags`, `mealLists`, etc.) apply as usual.

## Pipeline

### 1. Resolve video id

```bash
node -e "import { parseYouTubeVideoId } from './src/lib/youtube/parseYouTubeVideoId.ts'; console.log(parseYouTubeVideoId('URL'))"
```

Or extract manually from `v=` / `youtu.be/` / `shorts/`.

### 2. Extract timed steps (automated — preferred)

Library: `scripts/lib/fetch-youtube-timed-steps.mjs` — used by import and refresh scripts.

**Order:** YouTube chapters → description timestamps → **auto-captions** (yt-dlp `json3`).

```bash
npm run refresh:youtube-recipes
npm run refresh:youtube-recipes -- --slug=yt-25-min-chicken-tortilla-soup-...
```

- Never ship placeholder steps like `Watch full recipe` — re-run refresh or use browser fallback.
- `steps` must mirror `timedSteps[].text` (search + print).
- Ingredients: resolve `bit.ly` / themediterraneandish.com links from the description when present.

#### Manual / browser fallback (when automated extract is thin)

Use **cursor-ide-browser** only when refresh reports &lt;2 real steps:

1. `browser_navigate` → `sourceUrl`
2. Read **chapters** and **description** timestamps
3. Build `timedSteps` — one row per cooking action, ascending `startSeconds`
4. Do **not** invent steps without a moment in the video

#### One-off inspect

```bash
node scripts/lib/parse-youtube-timestamps.mjs --url='https://www.youtube.com/watch?v=VIDEO_ID'
```

### 3. Batch import (playlist or video list)

```bash
npm run import:youtube-playlist -- --playlist='https://www.youtube.com/playlist?list=PLAYLIST_ID'
npm run import:youtube-playlist -- --url='https://www.youtube.com/watch?v=VIDEO_ID'
npm run import:youtube-playlist -- --videos-file=scripts/data/my-playlist.json
```

Private playlists: use `--cookies-from-browser=chrome`, make the playlist **public/unlisted**, or export IDs:

```bash
yt-dlp --cookies-from-browser chrome --flat-playlist --print "%(id)s" 'PLAYLIST_URL' > scripts/data/playlist-ids.txt
```

Then build `scripts/data/my-playlist.json` as `[{ "id": "…", "title": "…" }, …]`.

### 4. Audit quality

```bash
npm run refresh:youtube-recipes   # fixes weak steps + fills blog ingredients
npm run normalize:notes         # moves Note:/TIPS from steps → notes
```

Reject catalog rows where `timedSteps` is empty, a single “watch” placeholder, `steps` ≠ `timedSteps` text, or any step looks like TOC (`isTableOfContentsSteps` in `scripts/lib/youtube-toc-steps.mjs`).

**Notes:** Read the full video **description** for `NOTE:`, `TIPS:`, or prose after the `RECIPE` block — merge into catalog `notes` via `extractNotesFromDescription()` / `applyRecipeNotes()`. Do not leave tips as fake steps or timed steps.

Default `mealLists` for imports: **`to-make`** (user queue).

### 5. Write catalog entry

1. Add or update row in `src/static-api/data/recipes.json`
2. Set `recipeKind`, `youtubeVideoId`, `timedSteps`, and `steps` (text only)
3. Set `imageUrl` to `https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg` when no custom image
4. Save audit: `src/static-api/data/enrichments/<slug>.json` with `{ "method": "youtube", "scrapedAt": "ISO" }`
5. Sync: `npm run sync:recipes-data`
6. `npm run test:run` — `catalog.test.ts`, `parseYouTubeVideoId.test.ts`, `TimedRecipeSteps.test.tsx`

### 6. Verify in the app

```bash
npm run dev
```

Open `/recipes/<slug>` — embedded player loads; clicking a step updates playback start time.

## How to write ingredients (required)

Ingredients must be **real food only** — never hashtags, music credits, affiliate blurbs, or `bensound.com`.

| Rule | Detail |
| ---- | ------ |
| Main protein first | For “Chicken Tortilla Soup”, `cooked whole chicken` is line 1 |
| No salt or table pepper | Never list `salt`, `kosher salt`, or `black`/`white` pepper as ingredients — season in directions only |
| Split amount / unit / name | `2` + `Tbsp` + `olive oil`, not one blob in `name` |
| One measure per line | When the source says `35g or 2 Tbsp` or `1/4 cup (60ml)`, store **one** US-friendly `amount`/`unit` — never duplicate units in `name` |
| Garnishes | Put under `group: "Garnishes"` after soup ingredients (from `RECOMMENDED GARNISHES` in description) |
| Sauce / marinade block | Ingredients for a whisked sauce or seasoning blend → shared `group` (e.g. `"Chili-lime sauce"`, `"Marinade"`) — infer from the whisk step via `normalizeCatalogIngredients()` |
| Broken fractions | `/2` → `1/2` — never leave a lone slash amount from description parsers |
| Filter on import | `scripts/lib/ingredient-lines.mjs` — used by `parseDescriptionRecipe()` and `npm run normalize:ingredients` |

### Capitalization (strict)

| Field | Rule | Example |
| ----- | ---- | ------- |
| `name` | **Lowercase** food nouns; prep after a comma stays lowercase | `olive oil`, `poblano pepper, medium diced`, `paprika` |
| `unit` | **Canonical** casing only | `Tbsp`, `tsp`, `cup`, `L`, `can` — never `TBSP`, `Tsp`, `tbsp` mixed in one recipe |
| Display | `src/static-api/units.ts` — see [ingredient-units.md](../../../docs/api-specs/data/ingredient-units.md) | `MEASURE_UNITS`, `UNIT_ALIASES`, `getIngredientDisplayParts()` |
| Render | `IngredientLine` component or `formatIngredientLine()` | Never `[amount, unit, name].join(' ')` by hand |

Wrong: `Olive Oil` + `paprika` with units `Tbsp` vs `TSP`. Right: `olive oil` + `paprika` with `Tbsp` + `tsp` from `MEASURE_UNITS`.

## How to write a step (required)

Steps must be **cookbook instructions**, not a video table of contents. Each step string has two parts: a **Uses** line (what you need right now) and the **instruction** (what to do).

### Uses line format (required)

First line of every step:

```text
Uses: olive oil · red onion · poblano pepper · garlic

Preheat a large Dutch oven over medium heat. Add the olive oil, red onion, and poblano…
```

| Rule | Detail |
| ---- | ------ |
| Prefix | Exactly `Uses: ` (capital U, colon, space) |
| Separators | Middle dot ` · ` between items (spaces around the dot) |
| Blank line | One empty line between the Uses line and the instruction |
| Names | Match ingredient `name` values (lowercase); short labels OK (`cumin` for `ground cumin`) |
| `timedSteps[].text` | Same format as `steps[]` — UI renders chips from the Uses line |

Helper: `formatRecipeStep(uses, instruction)` in `src/features/recipe-display/parseRecipeStep.ts`.

| Bad (TOC / chapter title) | Good (followable instruction) |
| ------------------------- | ------------------------------ |
| `Salad prep` | Uses line + `Mix the salad: In a large bowl, combine…` |
| `Dressing prep` | Uses: `olive oil · lemon · garlic · Dijon` then whisk instruction |
| `Intro` / `Ingredients` | Omit — not cooking steps |

### Step text rules

1. **Standalone** — A cook can follow without opening the video. The Uses line lists everything for that step; the instruction describes technique and doneness.
2. **Imperative** — Instruction starts with a verb: *Preheat*, *Stir*, *Simmer*, *Serve*.
3. **One action per step** — Split prep/bloom/simmer/blend/**serve**; don’t merge unrelated beats.
4. **Serve is its own step (when it adds information)** — Do **not** end a cook step with “Serve … Enjoy!”. Split:
   - **Cook step** ends at doneness: *Bake until the fish flakes easily… about 20–25 minutes.*
   - **Serve step** only if it names **how** to finish the plate (garnishes, sides, assembly): *Serve garnished with cilantro, sliced chili peppers, and lime wedges.*
   - **Omit** a serve step when the source only says *Serve hot*, *Enjoy!*, or repeats what the cook step already implied.
   - Drop **`Enjoy!`** / *Bon appetit* — not a step.
   - Automate: `polishRecipeSteps()` / `splitBakeAndServeStep()` in `scripts/lib/recipe-steps.mjs` (runs on enrich + `npm run normalize:notes`).
5. **Length** — Instruction: one to three sentences. Uses line: only what you touch in that step.
6. **`startSeconds`** — Optional seek hint from chapters or description timestamps. Attach to the step that **starts** that action in the video.
7. **Never ship chapter-only labels** — If YouTube chapters are short names (`Salad prep`, `Taste test`), fetch the linked blog (`bit.ly` / themediterraneandish.com) and use `mergeBlogStepsWithChapters()` (`scripts/lib/youtube-instruction-steps.mjs`).

### Where step text comes from (priority)

1. Linked recipe page (`parseRecipeHtml` on `FULL RECIPE` URL in description)
2. `RECIPE` prose block in the YouTube description
3. Auto-captions (last resort — trim to imperative sentences)
4. Manual/browser — watch the segment and write steps per rules above

Run `npm run refresh:youtube-recipes` after changing extraction logic.

## Timestamp rules

| Rule | Detail |
| ---- | ------ |
| Order | `startSeconds` non-decreasing |
| Granularity | One timed step per distinct cooking action (not every sentence) |
| Text | Full instruction (see above); not chapter titles |
| Zero | `0` only when step 1 truly starts at video open |
| Print | `steps` string array mirrors `timedSteps[].text` |

## UI contract

- Detail page uses `YouTubeRecipePlayer` + `TimedRecipeSteps` when `recipeKind === 'youtube'`.
- Player column is `position: sticky` so the embed stays visible while scrolling steps.
- Steps render as **readable text**; **Watch at M:SS** is a separate optional control (not the whole step).
- Seeking: iframe reload with `?start={seconds}&autoplay=1` when the watch link is used (no API key).
- Embed URL: `https://www.youtube.com/embed/{id}` with `origin`, `playsinline=1` (not `youtube-nocookie` — some embedded browsers show “Video unavailable” with nocookie).

## Related

- **recipes-import-recipe** — parent workflow (start here)
- **recipes-enrich-from-url** — non-YouTube sites
- **recipes-static-api** — loaders and types
- **api-specs** — [recipes-schema.md](../../../docs/api-specs/data/recipes-schema.md)
- **page-specs** — [recipe-detail.md](../../../docs/product-specs/pages/recipe-detail.md)
