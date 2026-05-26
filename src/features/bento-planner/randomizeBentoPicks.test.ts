import { describe, expect, it } from 'vitest';
import type { BentoIdea } from '@/static-api/types/bentoIdea';
import { randomizeBentoBox, randomizeBentoSlot } from './randomizeBentoPicks';

const ideas = (slugs: string[]): BentoIdea[] =>
  slugs.map((slug, idx) => ({
    id: String(idx + 1),
    slug,
    title: slug,
    section: 'snack',
  }));

describe('randomizeBentoBox', () => {
  it('picks unique non-current slugs up to itemCount', () => {
    const allIdeas = ideas(['a', 'b', 'c', 'd', 'e']);
    const out = randomizeBentoBox({
      ideas: allIdeas,
      itemCount: 3,
      currentPicks: ['a'],
      rng: () => 0,
    });
    // With rng=0, shuffle yields deterministic ordering:
    // candidates [b,c,d,e] -> [c,d,e,b], slice(0,3) => [c,d,e]
    expect(out).toEqual(['c', 'd', 'e']);
  });

  it('returns empty when itemCount is 0', () => {
    const allIdeas = ideas(['a', 'b']);
    const out = randomizeBentoBox({
      ideas: allIdeas,
      itemCount: 0,
      currentPicks: [],
      rng: () => 0.5,
    });
    expect(out).toEqual([]);
  });
});

describe('randomizeBentoSlot', () => {
  it('replaces the slot with a unique slug different from current', () => {
    const allIdeas = ideas(['a', 'b', 'c', 'd']);
    const out = randomizeBentoSlot({
      ideas: allIdeas,
      currentPicks: ['a'],
      slotIndex: 0,
      rng: () => 0,
    });
    // candidates exclude current => [b,c,d], rng=0 shuffle => [c,d,b], choose first => c
    expect(out).toEqual(['c']);
  });

  it('leaves picks unchanged when there is no alternative', () => {
    const allIdeas = ideas(['a']);
    const out = randomizeBentoSlot({
      ideas: allIdeas,
      currentPicks: ['a'],
      slotIndex: 0,
      rng: () => 0,
    });
    expect(out).toEqual(['a']);
  });
});

