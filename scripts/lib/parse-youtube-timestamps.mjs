#!/usr/bin/env node
/**
 * Parse timestamped lines from a YouTube video description.
 * Usage:
 *   node scripts/lib/parse-youtube-timestamps.mjs --url=https://youtube.com/watch?v=ID
 *   node scripts/lib/parse-youtube-timestamps.mjs --text="0:45 Prep\n1:30 Cook"
 */

const TIMESTAMP_LINE =
  /^(?:\(?)?(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\)?)?\s*[-–—:]?\s*(.+)$/;

function parseClockToSeconds(h, m, s) {
  const hours = Number(h);
  const minutes = Number(m);
  const seconds = Number(s ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

export function parseTimestampLines(text) {
  const timedSteps = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(TIMESTAMP_LINE);
    if (!match) continue;
    const [, a, b, c, label] = match;
    const startSeconds = c
      ? parseClockToSeconds(a, b, c)
      : parseClockToSeconds(0, a, b);
    const textLabel = label.trim();
    if (!textLabel) continue;
    timedSteps.push({ text: textLabel, startSeconds });
  }
  return timedSteps;
}

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0];
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2];
    return u.searchParams.get('v') ?? '';
  } catch {
    return '';
  }
}

async function fetchDescription(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; recipes-catalog/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const meta = html.match(
    /<meta\s+name="description"\s+content="([^"]*)"/i,
  );
  if (meta?.[1]) return meta[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const og = html.match(
    /<meta\s+property="og:description"\s+content="([^"]*)"/i,
  );
  if (og?.[1]) return og[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return '';
}

function readArg(name) {
  const entry = process.argv.find((a) => a.startsWith(`--${name}=`));
  return entry?.slice(name.length + 3);
}

async function main() {
  const url = readArg('url');
  const text = readArg('text');
  let description = text ?? '';
  let videoId = '';

  if (url) {
    videoId = extractVideoId(url);
    if (!description) description = await fetchDescription(url);
  }

  const timedSteps = parseTimestampLines(description);
  console.log(
    JSON.stringify({ videoId, timedSteps, lineCount: timedSteps.length }, null, 2),
  );
}

const isMain = process.argv[1]?.includes('parse-youtube-timestamps');
if (isMain) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
