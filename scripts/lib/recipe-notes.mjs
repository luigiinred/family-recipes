/**
 * Separate cookbook notes/tips from numbered instruction steps.
 */

const NOTE_PREFIX =
  /^(?:note[s]?|tip[s]?|chef'?s\s+note[s]?|pro\s+tip|recipe\s+notes?|did\s+you\s+know\??)\s*:?\s*/i;

const NOTE_ONLY_HEADER = /^(?:note[s]?|recipe\s+notes?|tips?)\s*:?\s*$/i;

const META_LINE =
  /^(?:storage|leftovers?|make[- ]ahead|substitution[s]?|serving\s+suggestion[s]?|nutrition|disclaimer)\s*:?\s*/i;

const COOKING_VERB =
  /^(?:preheat|add|stir|mix|simmer|bake|roast|whisk|serve|combine|heat|drain|season|cover|remove|transfer|bring|reduce|make|place|spread|fold|chop|dice|slice|toss|pour|blend|cook|brush|arrange|garnish|let|set|fill|roll|crush|mince|grate|zest|juice|pat|sear|sauté|saute|return|gradually|slowly|move|top|refrigerat|boil|broil|grill|air[- ]fry)/i;

/**
 * @param {string} text
 */
export function isRecipeNoteStep(text) {
  const t = (text || '').trim();
  if (!t) return false;
  if (NOTE_PREFIX.test(t)) return true;
  if (NOTE_ONLY_HEADER.test(t)) return true;
  if (META_LINE.test(t)) return true;
  // Commentary without a cooking verb and reads like a sidebar.
  if (
    t.length > 40 &&
    !COOKING_VERB.test(t) &&
    /(?:off[- ]flavor|you can also|feel free|don't hesitate|make sure to use|if desired|optional|muddy|substitut|store leftover|keep refrigerated|affiliate)/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

/**
 * @param {string} text
 */
export function formatNoteText(text) {
  return (text || '')
    .trim()
    .replace(NOTE_PREFIX, '')
    .replace(META_LINE, '')
    .trim();
}

/**
 * @param {string[]} chunks
 * @param {string} [existingNotes]
 */
export function mergeNotes(chunks, existingNotes = '') {
  const parts = [existingNotes, ...chunks]
    .map((n) => (n || '').trim())
    .filter(Boolean);
  return [...new Set(parts)].join('\n\n');
}

/**
 * Pull NOTE / TIPS blocks from a YouTube or blog description.
 * @param {string} description
 * @returns {string[]}
 */
export function extractNotesFromDescription(description) {
  if (!description) return [];
  const notes = [];
  const lines = description.split(/\r?\n/);
  let inNotes = false;
  let buffer = [];

  const flush = () => {
    const text = buffer.join(' ').trim();
    if (text.length > 10) notes.push(text);
    buffer = [];
    inNotes = false;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inNotes) flush();
      continue;
    }
    if (/^https?:\/\//i.test(line)) continue;
    if (/^(?:note[s]?|tips?|pro tip)\s*:?\s*$/i.test(line)) {
      if (inNotes) flush();
      inNotes = true;
      continue;
    }
    if (/^(?:note[s]?|tips?|pro tip)\s*:/i.test(line)) {
      if (inNotes) flush();
      inNotes = true;
      buffer.push(line.replace(/^(?:note[s]?|tips?|pro tip)\s*:/i, '').trim());
      continue;
    }
    if (inNotes) {
      if (/^⏱️?\s*chapters/i.test(line) || /^📌/i.test(line)) {
        flush();
        continue;
      }
      buffer.push(line);
    }
  }
  if (inNotes) flush();
  return notes;
}

/**
 * @param {string} html
 * @returns {string[]}
 */
export function extractNotesFromHtml(html) {
  if (!html) return [];
  const notes = [];
  const patterns = [
    /<(?:div|p|aside)[^>]*class=["'][^"']*(?:recipe-notes?|post-note|tip-box|recipe-tip)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p|aside)>/gi,
    /<h[34][^>]*>\s*notes?\s*<\/h[34]>\s*([\s\S]*?)(?=<h[234]|$)/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) {
      const text = m[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length > 15) notes.push(text);
    }
  }
  return notes;
}

/**
 * @param {string[]} steps
 * @param {string} [existingNotes]
 * @returns {{ steps: string[], notes: string }}
 */
export function splitStepsAndNotes(steps, existingNotes = '') {
  const cookSteps = [];
  const noteChunks = [];

  for (const step of steps || []) {
    if (isRecipeNoteStep(step)) {
      const body = formatNoteText(step);
      if (body) noteChunks.push(body);
    } else {
      cookSteps.push(step);
    }
  }

  return {
    steps: cookSteps,
    notes: mergeNotes(noteChunks, existingNotes),
  };
}

/**
 * @param {{ steps?: string[], timedSteps?: { text: string, startSeconds: number }[], notes?: string, description?: string }} recipe
 * @param {string} [html]
 */
export function applyRecipeNotes(recipe, html = '') {
  const fromDesc = extractNotesFromDescription(recipe.description || '');
  const fromHtml = extractNotesFromHtml(html);
  const { steps, notes } = splitStepsAndNotes(recipe.steps || [], recipe.notes || '');

  let timedSteps = recipe.timedSteps;
  if (timedSteps?.length) {
    timedSteps = timedSteps.filter((s) => !isRecipeNoteStep(s.text));
    if (!timedSteps.length) timedSteps = undefined;
  }

  const mergedNotes = mergeNotes([...fromHtml, ...fromDesc], notes);

  return {
    steps,
    timedSteps: timedSteps?.length ? timedSteps : undefined,
    notes: mergedNotes || undefined,
  };
}
