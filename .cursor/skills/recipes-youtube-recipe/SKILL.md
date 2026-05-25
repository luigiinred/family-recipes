---
name: recipes-youtube-recipe
description: >-
  Import and enrich YouTube cooking videos as timestamped video recipes in the
  catalog. Extracts chapter markers and description timestamps, writes
  recipeKind youtube with timedSteps, and verifies embed playback. Use when
  sourceUrl is youtube.com or youtu.be, the user asks for a video recipe, or
  steps need jump-to timestamps in the embedded player.
---

# YouTube video recipes

Add recipes sourced from **YouTube videos** with **clickable steps** that seek the embedded player.

## When to use

- User bookmarks a YouTube cooking video
- `sourceUrl` matches `youtube.com/watch`, `youtu.be/`, or `/shorts/`
- Steps should jump to moments in the video on the recipe detail page

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

### 2. Fetch timestamp candidates (try in order)

#### A. Description timestamps (script)

```bash
node scripts/lib/parse-youtube-timestamps.mjs --url='https://www.youtube.com/watch?v=VIDEO_ID'
```

- Fetches the public watch page HTML (no API key).
- Parses lines like `0:45 Chop onions`, `1:02:30 Simmer`, `(2:15) Rest dough`.
- Outputs JSON: `{ videoId, timedSteps: [{ text, startSeconds }] }`.

#### B. Cursor browser (when script finds few/no markers)

Use **cursor-ide-browser** — required to **watch / scan** the video for important moments.

1. `browser_navigate` → `sourceUrl` (or embed URL)
2. `browser_snapshot` — read **description** and **chapter list** (if present)
3. Play through key moments (or read auto-generated chapters):
   - Note **start time** for each cooking step (prep, cook, rest, serve)
   - Prefer chapter titles from the creator; otherwise infer from narration
4. Build `timedSteps` — one object per meaningful step, ascending `startSeconds`
5. Do **not** invent steps without a corresponding moment in the video

#### C. Manual merge

Combine script output + browser notes. Drop duplicate timestamps; keep the clearest step label.

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

### 4. Write catalog entry

1. Add or update row in `src/static-api/data/recipes.json`
2. Set `recipeKind`, `youtubeVideoId`, `timedSteps`, and `steps` (text only)
3. Set `imageUrl` to `https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg` when no custom image
4. Save audit: `src/static-api/data/enrichments/<slug>.json` with `{ "method": "youtube", "scrapedAt": "ISO" }`
5. Sync: `npm run sync:recipes-data`
6. `npm run test:run` — `catalog.test.ts`, `parseYouTubeVideoId.test.ts`, `TimedRecipeSteps.test.tsx`

### 5. Verify in the app

```bash
npm run dev
```

Open `/recipes/<slug>` — embedded player loads; clicking a step updates playback start time.

## Timestamp rules

| Rule | Detail |
| ---- | ------ |
| Order | `startSeconds` non-decreasing |
| Granularity | One timed step per distinct cooking action (not every sentence) |
| Text | Short imperative labels; full detail can stay in `notes` |
| Zero | `0` only for true intro/prep at video start |
| Print | `steps` string array still populated for print layout |

## UI contract

- Detail page uses `YouTubeRecipePlayer` + `TimedRecipeSteps` when `recipeKind === 'youtube'`.
- Player column is `position: sticky` so the embed stays visible while scrolling steps.
- Seeking: iframe reload with `?start={seconds}&autoplay=1` after a step click (no API key).
- Embed URL: `https://www.youtube.com/embed/{id}` with `origin`, `playsinline=1` (not `youtube-nocookie` — some embedded browsers show “Video unavailable” with nocookie).

## Related

- **recipes-enrich-from-url** — non-YouTube sites
- **recipes-static-api** — loaders and types
- **api-specs** — [recipes-schema.md](../../../docs/api-specs/data/recipes-schema.md)
- **page-specs** — [recipe-detail.md](../../../docs/product-specs/pages/recipe-detail.md)
