#!/usr/bin/env node
/**
 * Import YouTube videos as timestamped video recipes.
 *
 *   npm run import:youtube-playlist -- --playlist='https://www.youtube.com/playlist?list=ID'
 *   npm run import:youtube-playlist -- --url='https://www.youtube.com/watch?v=ID'
 *   npm run import:youtube-playlist -- --videos-file=scripts/data/playlist-videos.json
 *   npm run import:youtube-playlist -- --playlist=... --cookies-from-browser=chrome
 *
 * Private playlists: make the playlist public/unlisted, or export video IDs with yt-dlp
 * using your browser cookies, then pass --videos-file.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from './lib/parse-byonandlara.mjs';
import { parseTimestampLines } from './lib/parse-youtube-timestamps.mjs';
import { parseRecipeHtml } from './lib/parse-recipe-html.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const catalogPath = join(root, 'src/static-api/data/recipes.json');
const enrichDir = join(root, 'src/static-api/data/enrichments');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function readArg(name) {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

const dryRun = process.argv.includes('--dry-run');
const playlistUrl = readArg('playlist');
const watchUrl = readArg('url');
const videosFile = readArg('videos-file');
const cookiesBrowser = readArg('cookies-from-browser');
const mealList = readArg('meal-list') || 'saved';
const tag = readArg('tag') || 'youtube';

function ytDlpArgs(extra) {
  const base = ['--no-warnings', '--no-progress'];
  if (cookiesBrowser) {
    base.push('--cookies-from-browser', cookiesBrowser);
  }
  return [...base, ...extra];
}

function ytDlpAvailable() {
  const r = spawnSync('yt-dlp', ['--version'], { encoding: 'utf8' });
  return r.status === 0;
}

function listFromYtDlp(url) {
  const out = execFileSync(
    'yt-dlp',
    ytDlpArgs(['--flat-playlist', '--print', '%(id)s\t%(title)s', url]),
    { encoding: 'utf8' },
  );
  return out
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const tab = line.indexOf('\t');
      if (tab === -1) return { id: line.trim(), title: '' };
      return { id: line.slice(0, tab), title: line.slice(tab + 1) };
    });
}

function dumpVideoJson(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const out = execFileSync('yt-dlp', ytDlpArgs(['--dump-single-json', url]), {
    encoding: 'utf8',
  });
  return JSON.parse(out);
}

function chaptersToTimedSteps(chapters) {
  if (!chapters?.length) return [];
  return chapters.map((c) => ({
    text: c.title.trim(),
    startSeconds: Math.floor(c.start_time ?? 0),
  }));
}

function extractBlogUrl(description) {
  const direct = description?.match(
    /https?:\/\/(?:www\.)?themediterraneandish\.com\/[^\s)]+/i,
  );
  if (direct) return direct[0].replace(/[.,]+$/, '');
  const bitly = description?.match(/https?:\/\/bit\.ly\/[^\s)]+/i);
  return bitly?.[0]?.replace(/[.,]+$/, '') ?? '';
}

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
    const html = await res.text();
    return parseRecipeHtml(html);
  } catch {
    return null;
  }
}

function nextNumericId(recipes) {
  const max = recipes.reduce(
    (n, r) => Math.max(n, Number.parseInt(r.id, 10) || 0),
    0,
  );
  return String(max + 1);
}

function uniqueSlug(base, existing) {
  let slug = base;
  let n = 2;
  while (existing.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function buildRecipeEntry({ meta, timedSteps, blog, catalog }) {
  const videoId = meta.id;
  const title =
    (meta.title || '')
      .replace(/\s*\|\s*The Mediterranean Dish\s*$/i, '')
      .trim() || 'YouTube recipe';
  const baseSlug = `yt-${slugify(title)}`;
  const slug = uniqueSlug(baseSlug, new Set(catalog.recipes.map((r) => r.slug)));
  const steps = timedSteps.map((s) => s.text);
  const sourceUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const imageUrl =
    blog?.imageUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return {
    id: nextNumericId(catalog.recipes),
    slug,
    title,
    description:
      blog?.description?.slice(0, 500) ||
      meta.description?.split('\n')[0]?.slice(0, 300) ||
      `Video recipe from The Mediterranean Dish.`,
    imageUrl,
    prepMinutes: blog?.prepMinutes || 0,
    cookMinutes: blog?.cookMinutes || 0,
    servings: blog?.servings || 4,
    tags: [tag, 'mediterranean'].filter(
      (t, i, arr) => arr.indexOf(t) === i,
    ),
    ingredients: blog?.ingredients?.length ? blog.ingredients : [],
    steps: steps.length ? steps : ['Watch the video for full instructions.'],
    recipeKind: 'youtube',
    youtubeVideoId: videoId,
    timedSteps,
    sourceUrl,
    mealLists: [mealList],
    notes: blog
      ? `Imported from YouTube; ingredients from ${extractBlogUrl(meta.description) || 'companion article'}.`
      : 'Imported from YouTube; timestamps from video chapters.',
  };
}

async function resolveVideoList() {
  if (videosFile) {
    const raw = JSON.parse(readFileSync(join(root, videosFile), 'utf8'));
    if (Array.isArray(raw)) {
      return raw.map((v) =>
        typeof v === 'string'
          ? { id: v, title: '' }
          : { id: v.id || v.videoId, title: v.title || '' },
      );
    }
    if (raw.videos) return raw.videos;
    throw new Error('--videos-file must be an array or { videos: [...] }');
  }

  if (!ytDlpAvailable()) {
    throw new Error('yt-dlp is required. Install with: brew install yt-dlp');
  }

  const url =
    playlistUrl ||
    watchUrl ||
    (() => {
      throw new Error(
        'Pass --playlist=URL, --url=WATCH_URL, or --videos-file=path.json',
      );
    })();

  const videos = listFromYtDlp(url);
  if (videos.length === 0) {
    throw new Error(
      'No videos found. Private playlists need --cookies-from-browser=chrome or a public/unlisted playlist.',
    );
  }
  return videos;
}

async function main() {
  const videos = await resolveVideoList();
  console.log(`Importing ${videos.length} video(s)…`);

  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const byVideoId = new Map(
    catalog.recipes
      .filter((r) => r.youtubeVideoId)
      .map((r) => [r.youtubeVideoId, r]),
  );

  const added = [];
  const skipped = [];

  for (const item of videos) {
    const videoId = item.id;
    if (!videoId || videoId.length !== 11) {
      skipped.push({ videoId, reason: 'invalid id' });
      continue;
    }
    if (byVideoId.has(videoId)) {
      skipped.push({ videoId, reason: 'already in catalog' });
      continue;
    }

    let meta;
    try {
      meta = dumpVideoJson(videoId);
    } catch (err) {
      skipped.push({ videoId, reason: err.message });
      continue;
    }

    let timedSteps = chaptersToTimedSteps(meta.chapters);
    if (timedSteps.length === 0) {
      timedSteps = parseTimestampLines(meta.description || '');
    }
    if (timedSteps.length === 0) {
      timedSteps = [{ text: 'Watch full recipe', startSeconds: 0 }];
    }

    const blogUrl = extractBlogUrl(meta.description);
    const blog = await fetchBlogFields(blogUrl);
    const entry = buildRecipeEntry({ meta, timedSteps, blog, catalog });

    if (dryRun) {
      console.log(`[dry-run] would add ${entry.slug} (${videoId})`);
      added.push(entry.slug);
      continue;
    }

    catalog.recipes.push(entry);
    byVideoId.set(videoId, entry);
    added.push(entry.slug);

    mkdirSync(enrichDir, { recursive: true });
    writeFileSync(
      join(enrichDir, `${entry.slug}.json`),
      JSON.stringify(
        {
          method: 'youtube',
          scrapedAt: new Date().toISOString(),
          videoId,
          blogUrl: blogUrl || null,
          timedStepsCount: timedSteps.length,
        },
        null,
        2,
      ) + '\n',
    );

    console.log(`  ✓ ${entry.slug} — ${timedSteps.length} timed steps`);
    await new Promise((r) => setTimeout(r, 300));
  }

  if (!dryRun && added.length > 0) {
    const json = JSON.stringify(catalog, null, 2) + '\n';
    writeFileSync(catalogPath, json);
    writeFileSync(join(root, 'public/data/recipes.json'), json);
    console.log(`\nWrote ${added.length} recipe(s). Total: ${catalog.recipes.length}`);
  } else if (dryRun) {
    console.log(`\nDry run: ${added.length} would be added`);
  }

  if (skipped.length) {
    console.log('Skipped:', skipped);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
