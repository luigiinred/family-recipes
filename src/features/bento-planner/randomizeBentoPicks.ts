import type { BentoIdea } from '@/static-api/types/bentoIdea';

export type BentoRandomFn = () => number;

function shuffle<T>(items: T[], rng: BentoRandomFn): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    // Fisher–Yates shuffle with injectable RNG for deterministic tests.
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function uniqueSlugs(ideas: BentoIdea[]): string[] {
  return Array.from(new Set(ideas.map((i) => i.slug)));
}

export function randomizeBentoBox({
  ideas,
  itemCount,
  currentPicks,
  rng = Math.random,
}: {
  ideas: BentoIdea[];
  itemCount: number;
  currentPicks: string[];
  rng?: BentoRandomFn;
}): string[] {
  const slugs = uniqueSlugs(ideas);
  const target = Math.min(Math.max(0, itemCount), slugs.length);
  if (target === 0) return [];

  const currentSet = new Set(currentPicks);
  const candidates = slugs.filter((s) => !currentSet.has(s));
  const pickedFromCandidates = shuffle(candidates, rng).slice(0, target);

  if (pickedFromCandidates.length === target) return pickedFromCandidates;

  // Not enough non-current ideas; fill remaining slots with random current picks.
  const remaining = target - pickedFromCandidates.length;
  const remainingCandidates = currentPicks.filter((s) => !pickedFromCandidates.includes(s));
  const fill = shuffle(remainingCandidates, rng).slice(0, remaining);
  return [...pickedFromCandidates, ...fill].slice(0, target);
}

export function randomizeBentoSlot({
  ideas,
  currentPicks,
  slotIndex,
  rng = Math.random,
}: {
  ideas: BentoIdea[];
  currentPicks: string[];
  slotIndex: number;
  rng?: BentoRandomFn;
}): string[] {
  if (slotIndex < 0 || slotIndex >= currentPicks.length) return currentPicks;

  const slugs = uniqueSlugs(ideas);
  const currentSlug = currentPicks[slotIndex];
  const currentSet = new Set(currentPicks);

  // Prefer swapping with an unused slug to keep picks unique and guarantee a visible change.
  const candidates = slugs.filter((s) => !currentSet.has(s) && s !== currentSlug);
  if (candidates.length === 0) return currentPicks;

  const chosen = shuffle(candidates, rng)[0];
  const next = [...currentPicks];
  next[slotIndex] = chosen;
  return next;
}

