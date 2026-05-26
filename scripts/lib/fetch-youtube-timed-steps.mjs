/**
 * Extract timed cooking steps from a YouTube video (chapters → description → auto-captions).
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseTimestampLines } from './parse-youtube-timestamps.mjs';
import { isTableOfContentsSteps } from './youtube-toc-steps.mjs';

const ACTION =
  /\b(add|stir|mix|heat|simmer|boil|chop|dice|slice|pour|season|cover|bake|fry|saute|sauté|blend|whisk|serve|remove|transfer|reduce|cook|bring|combine|place|top|garnish|drain|rinse|melt|brown|sear|roast|toast|shred|cut|mince|peel|grate|zest|squeeze|marinate|start by|first|next|then|now|once|when the|let's)\b/i;

const SKIP =
  /subscribe|patreon|amazon link|affiliate|thanks for watching|smash that like|link in the description|check out my/i;

const PLACEHOLDER = /^watch (full recipe|the video)/i;

function ytDlpArgs(extra, cookiesBrowser) {
  const base = ['--no-warnings', '--no-progress'];
  if (cookiesBrowser) base.push('--cookies-from-browser', cookiesBrowser);
  return [...base, ...extra];
}

export function dumpVideoJson(videoId, cookiesBrowser) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const out = execFileSync(
    'yt-dlp',
    ytDlpArgs(['--dump-single-json', url], cookiesBrowser),
    { encoding: 'utf8' },
  );
  return JSON.parse(out);
}

export function chaptersToTimedSteps(chapters) {
  if (!chapters?.length) return [];
  return chapters.map((c) => ({
    text: c.title.trim(),
    startSeconds: Math.floor(c.start_time ?? 0),
  }));
}

function mergeCues(events) {
  const cues = events
    .filter((e) => e.segs)
    .map((e) => ({
      start: e.tStartMs / 1000,
      text: e.segs
        .map((s) => s.utf8)
        .join('')
        .replace(/\n/g, ' ')
        .trim(),
    }))
    .filter((c) => c.text);

  const merged = [];
  for (const c of cues) {
    const last = merged.at(-1);
    if (last && c.start - last.end < 1.5) {
      last.text += ` ${c.text}`;
      last.end = c.start + 1.5;
    } else {
      merged.push({ start: c.start, end: c.start + 1.5, text: c.text });
    }
  }
  return merged;
}

function labelFromCaptionText(raw) {
  const t = raw.replace(/\s+/g, ' ').trim();
  if (t.length < 18 || SKIP.test(t)) return '';

  const verbMatch = t.match(
    /(?:then |now |so |and |next )?((?:add|stir|mix|heat|simmer|boil|chop|dice|slice|pour|season|cover|bake|fry|saute|sauté|blend|whisk|serve|remove|transfer|reduce|cook|bring|combine|place|top|garnish|drain|rinse|melt|brown|sear|roast|toast|shred|cut|mince|peel|grate|zest|squeeze|marinate|start by|first|next|let's)[^.!?]{8,110})/i,
  );
  let text = (verbMatch?.[1] || t).trim();
  if (/^the first step/i.test(text)) {
    text = text.replace(/^the first step (?:here )?is to /i, '');
  }
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (text.length > 100) text = `${text.slice(0, 97)}…`;
  return text;
}

export function captionsToTimedSteps(events) {
  const merged = mergeCues(events);
  const clusters = [];

  for (const line of merged) {
    if (line.text.length < 15 || SKIP.test(line.text) || !ACTION.test(line.text)) {
      continue;
    }
    const last = clusters.at(-1);
    if (last && line.start - last.start < 18) {
      last.text += ` ${line.text}`;
      last.end = line.end;
    } else {
      clusters.push({
        start: line.start,
        end: line.end,
        text: line.text,
      });
    }
  }

  const steps = [];
  for (const cluster of clusters) {
    const text = labelFromCaptionText(cluster.text);
    if (!text || text.length < 12 || PLACEHOLDER.test(text)) continue;
    const startSeconds = Math.floor(cluster.start);
    if (steps.length && startSeconds - steps.at(-1).startSeconds < 15) continue;
    steps.push({ text, startSeconds });
  }

  return steps.slice(0, 14);
}

function downloadAutoCaptions(videoId, cookiesBrowser) {
  const dir = mkdtempSync(join(tmpdir(), 'yt-subs-'));
  try {
    execFileSync(
      'yt-dlp',
      ytDlpArgs(
        [
          '--skip-download',
          '--write-auto-sub',
          '--sub-lang',
          'en',
          '--sub-format',
          'json3',
          '-o',
          join(dir, '%(id)s'),
          `https://www.youtube.com/watch?v=${videoId}`,
        ],
        cookiesBrowser,
      ),
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    );
    const file = readFileSync(join(dir, `${videoId}.en.json3`), 'utf8');
    return JSON.parse(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * @returns {{ timedSteps: {text:string,startSeconds:number}[], source: 'chapters'|'description'|'captions' }}
 */
export function extractTimedSteps(meta, cookiesBrowser) {
  const fromChapters = chaptersToTimedSteps(meta.chapters);
  if (
    fromChapters.length >= 2 &&
    !fromChapters.every((s) => PLACEHOLDER.test(s.text)) &&
    !isTableOfContentsSteps(fromChapters)
  ) {
    return { timedSteps: fromChapters, source: 'chapters' };
  }

  const fromDesc = parseTimestampLines(meta.description || '');
  if (fromDesc.length >= 2) {
    return { timedSteps: fromDesc, source: 'description' };
  }

  const inline = parseDescriptionRecipe(meta.description || '');
  if (inline?.steps?.length >= 2) {
    return {
      timedSteps: proseStepsToTimedSteps(inline.steps),
      source: 'description-recipe',
      inlineRecipe: inline,
    };
  }

  try {
    const subs = downloadAutoCaptions(meta.id, cookiesBrowser);
    const fromCaptions = captionsToTimedSteps(subs.events || []);
    if (fromCaptions.length >= 2) {
      return { timedSteps: fromCaptions, source: 'captions' };
    }
    if (fromCaptions.length === 1) {
      return { timedSteps: fromCaptions, source: 'captions' };
    }
  } catch {
    /* no captions */
  }

  if (fromChapters.length) return { timedSteps: fromChapters, source: 'chapters' };
  if (fromDesc.length) return { timedSteps: fromDesc, source: 'description' };

  return { timedSteps: [], source: 'none' };
}

export function isLowQualityTimedSteps(timedSteps) {
  if (!timedSteps?.length) return true;
  if (isTableOfContentsSteps(timedSteps)) return true;
  if (timedSteps.length === 1 && PLACEHOLDER.test(timedSteps[0].text)) {
    return true;
  }
  if (timedSteps.every((s) => PLACEHOLDER.test(s.text) || s.text.length < 8)) {
    return true;
  }
  return false;
}

/** Higher is better — prefer curated short steps over noisy captions. */
export function scoreTimedSteps(timedSteps) {
  if (isLowQualityTimedSteps(timedSteps)) return 0;
  let score = timedSteps.length * 12;
  for (const { text } of timedSteps) {
    if (PLACEHOLDER.test(text)) score -= 50;
    if (text.length > 110 || text.endsWith('…')) score -= 8;
    if (/^(place and|drained because|chopped half)/i.test(text)) score -= 6;
    if (text.length >= 12 && text.length <= 90) score += 3;
  }
  return score;
}

/** Parse inline RECIPE / INGREDIENTS blocks from YouTube descriptions. */
export function parseDescriptionRecipe(description) {
  if (!description) return null;

  const ingredients = [];
  const steps = [];
  const lines = description.split(/\r?\n/).map((l) => l.trim());

  let inIngredients = false;
  let pastIngredientsHeader = false;

  for (const line of lines) {
    if (!line || /^[-–—]{2,}$/.test(line)) continue;
    if (/^https?:\/\//i.test(line)) continue;

    if (
      /ingredients\s*:/i.test(line) ||
      /^\*{0,2}\s*ingredients/i.test(line) ||
      /^ingredients with/i.test(line) ||
      /^\*INGREDIENTS\*$/i.test(line)
    ) {
      inIngredients = true;
      pastIngredientsHeader = true;
      continue;
    }
    if (
      /^\*{0,2}\s*recipe\s*\*{0,2}$/i.test(line) ||
      line === '***RECIPE***'
    ) {
      inIngredients = true;
      continue;
    }
    if (/^⏱️?\s*chapters/i.test(line) || /^📌connect/i.test(line)) {
      inIngredients = false;
      continue;
    }

    const isBullet = /^[▪•·🔹🍅📌]/.test(line) || /^·/.test(line);
    const looksLikeIngredient =
      isBullet ||
      (inIngredients &&
        (pastIngredientsHeader || isBullet) &&
        line.length < 120 &&
        !/[.!?]$/.test(line) &&
        !/^(first |when |while |put |heat |add |stir |pour |cook |bake |serve |prepare |watch |click |follow )/i.test(
          line,
        ));

    if (looksLikeIngredient && ingredients.length < 30) {
      const raw = line.replace(/^[▪•·🔹🍅📌\-]\s*/, '').trim();
      if (
        raw.length > 2 &&
        !/^https?:\/\//i.test(raw) &&
        !/youtube\.com|playlist\?list=/i.test(raw) &&
        !/^(full recipe|more |popular products|my cookbook|shop:|website:|subscribe)/i.test(
          raw,
        )
      ) {
        ingredients.push({ amount: '', unit: '', name: raw });
        inIngredients = true;
      }
      continue;
    }

    if (
      line.length > 50 &&
      /[.!?]$/.test(line) &&
      /^(first |when |while |put |heat |add |stir |pour |cook |bake |serve |prepare |combine |preheat|peel |slice |dice |chop |drain|season|reduce|remove|transfer|let |you can)/i.test(
        line,
      )
    ) {
      steps.push(line);
      inIngredients = false;
    }
  }

  if (ingredients.length < 2 && steps.length < 1) return null;
  return { ingredients, steps };
}

export function proseStepsToTimedSteps(steps, intervalSeconds = 45) {
  return steps.map((text, i) => ({
    text: text.length > 100 ? `${text.slice(0, 97)}…` : text,
    startSeconds: i * intervalSeconds,
  }));
}

export function pickBetterTimedSteps(current, candidate) {
  if (!candidate?.length) return current;
  if (!current?.length) return candidate;
  return scoreTimedSteps(candidate) > scoreTimedSteps(current)
    ? candidate
    : current;
}
