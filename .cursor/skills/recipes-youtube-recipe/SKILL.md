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
```

Reject catalog rows where `timedSteps` is empty, a single “watch” placeholder, `steps` ≠ `timedSteps` text, or any step looks like TOC (`isTableOfContentsSteps` in `scripts/lib/youtube-toc-steps.mjs`).

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

## How to write a step (required)

Steps must be **cookbook instructions**, not a video table of contents.

| Bad (TOC / chapter title) | Good (followable instruction) |
| ------------------------- | ------------------------------ |
| `Salad prep` | `Mix the salad: In a large bowl, combine shredded chicken, shallots, celery, artichokes, sun-dried tomatoes, parsley, and walnuts.` |
| `Dressing prep` | `Make the dressing: Whisk olive oil, lemon zest and juice, garlic, Dijon, sumac, and paprika in a small bowl.` |
| `Intro` / `Ingredients` | Omit — not cooking steps |

### Step text rules

1. **Standalone** — A cook can follow without opening the video. Include bowl sizes, key ingredients named, and what “done” looks like when it matters.
2. **Imperative** — Start with a verb: *Make*, *Mix*, *Pour*, *Simmer*, *Serve*.
3. **One action per step** — Split prep/dress/combine/serve; don’t merge unrelated beats.
4. **Length** — Aim for one to three sentences (roughly 40–220 characters). Shorter than a blog paragraph is fine; longer than a chapter label.
5. **`startSeconds`** — Optional seek hint from chapters or description timestamps. Attach to the step that **starts** that action in the video.
6. **Never ship chapter-only labels** — If YouTube chapters are short names (`Salad prep`, `Taste test`), fetch the linked blog (`bit.ly` / themediterraneandish.com) and use `mergeBlogStepsWithChapters()` (`scripts/lib/youtube-instruction-steps.mjs`).

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
