import { getIngredientDisplayParts } from '@/static-api/units';
import type { Ingredient } from '@/static-api/types/recipe';

export type IngredientMatch = {
  /** Lowercase phrase to find in instruction text */
  phrase: string;
  ingredient: Ingredient;
};

const PEPPER_PRODUCE =
  /\b(bell|sweet|chili|chile|jalapeño|habanero|serrano|poblano|cayenne|bird[- ]eye)\b/i;

/** Salt and table pepper are not linkable catalog ingredients. */
export function isSeasoningOnlyMention(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t || PEPPER_PRODUCE.test(t)) return false;
  if (/^salt\b/.test(t)) return true;
  if (/^(fresh(ly)?\s+)?(ground\s+)?(black|white)\s+pepper\b/.test(t)) return true;
  return false;
}

function matchPhrasesForIngredient(ing: Ingredient): string[] {
  const { name } = getIngredientDisplayParts(ing);
  const base = name.split(',')[0]?.trim().toLowerCase() ?? '';
  if (!base || base.length < 3) return [];

  const phrases = new Set<string>();
  phrases.add(base);

  const words = base.split(/\s+/).filter((w) => w.length >= 4);
  if (words.length >= 2) {
    phrases.add(words.slice(-2).join(' '));
  }
  if (words.length >= 1 && words[words.length - 1].length >= 5) {
    phrases.add(words[words.length - 1]);
  }

  return [...phrases].filter((p) => p.length >= 3 && !isSeasoningOnlyMention(p));
}

/** Longest phrases first so "chicken stock" wins over "chicken". */
export function buildIngredientMatches(ingredients: Ingredient[]): IngredientMatch[] {
  const seen = new Set<string>();
  const matches: IngredientMatch[] = [];

  for (const ing of ingredients) {
    for (const phrase of matchPhrasesForIngredient(ing)) {
      if (seen.has(phrase)) continue;
      seen.add(phrase);
      matches.push({ phrase, ingredient: ing });
    }
  }

  return matches.sort((a, b) => b.phrase.length - a.phrase.length);
}

export type InstructionSegment =
  | { type: 'text'; value: string }
  | { type: 'ingredient'; value: string; ingredient: Ingredient };

/**
 * Split instruction prose into plain text and linkable ingredient spans.
 */
export function segmentInstructionWithIngredients(
  instruction: string,
  ingredients: Ingredient[],
): InstructionSegment[] {
  if (!instruction.trim() || ingredients.length === 0) {
    return [{ type: 'text', value: instruction }];
  }

  const matches = buildIngredientMatches(ingredients);
  if (matches.length === 0) {
    return [{ type: 'text', value: instruction }];
  }

  const segments: InstructionSegment[] = [];
  let cursor = 0;
  const lower = instruction.toLowerCase();

  while (cursor < instruction.length) {
    let best: { index: number; length: number; match: IngredientMatch } | null = null;

    for (const match of matches) {
      const idx = lower.indexOf(match.phrase, cursor);
      if (idx === -1) continue;
      if (!isWordBoundary(lower, idx, match.phrase.length)) continue;
      if (!best || idx < best.index || (idx === best.index && match.phrase.length > best.length)) {
        best = { index: idx, length: match.phrase.length, match };
      }
    }

    if (!best) {
      segments.push({ type: 'text', value: instruction.slice(cursor) });
      break;
    }

    if (best.index > cursor) {
      segments.push({ type: 'text', value: instruction.slice(cursor, best.index) });
    }

    segments.push({
      type: 'ingredient',
      value: instruction.slice(best.index, best.index + best.length),
      ingredient: best.match.ingredient,
    });
    cursor = best.index + best.length;
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: instruction }];
}

function isWordBoundary(text: string, index: number, length: number): boolean {
  const before = index > 0 ? text[index - 1] : ' ';
  const after = index + length < text.length ? text[index + length] : ' ';
  return !/[a-z0-9]/i.test(before) && !/[a-z0-9]/i.test(after);
}
