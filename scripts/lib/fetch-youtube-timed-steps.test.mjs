import { describe, expect, it } from 'vitest';
import {
  captionsToTimedSteps,
  chaptersToTimedSteps,
  isLowQualityTimedSteps,
  parseDescriptionRecipe,
  pickBetterTimedSteps,
  scoreTimedSteps,
} from './fetch-youtube-timed-steps.mjs';

describe('chaptersToTimedSteps', () => {
  it('maps chapter start times to timed steps', () => {
    expect(
      chaptersToTimedSteps([
        { title: 'Prep', start_time: 0 },
        { title: 'Cook', start_time: 90 },
      ]),
    ).toEqual([
      { text: 'Prep', startSeconds: 0 },
      { text: 'Cook', startSeconds: 90 },
    ]);
  });
});

describe('isLowQualityTimedSteps', () => {
  it('flags placeholder watch steps', () => {
    expect(
      isLowQualityTimedSteps([{ text: 'Watch full recipe', startSeconds: 0 }]),
    ).toBe(true);
  });

  it('accepts real cooking steps', () => {
    expect(
      isLowQualityTimedSteps([
        { text: 'Dice onions', startSeconds: 18 },
        { text: 'Simmer beans', startSeconds: 120 },
      ]),
    ).toBe(false);
  });
});

describe('parseDescriptionRecipe', () => {
  it('parses bullet ingredients after INGREDIENTS header', () => {
    const parsed = parseDescriptionRecipe(`🍅INGREDIENTS: 🍅
🔹 16 ounces gnocchi
🔹 1 red bell pepper, chopped
Preheat oven. Add gnocchi to the pan. Bake until golden.`);
    expect(parsed?.ingredients.length).toBe(2);
    expect(parsed?.steps.length).toBeGreaterThanOrEqual(1);
  });

  it('drops hashtags, salt, and music credits from RECIPE blocks', () => {
    const parsed = parseDescriptionRecipe(`------
RECIPE
------
▪Salt
▪1 red onion, medium diced
▪Cooked whole chicken
RECOMMENDED GARNISHES
▪Ripe avocado, diced
#chickentortillasoup
|| MUSIC ||
bensound.com`);
    const names = parsed?.ingredients.map((i) => i.name) ?? [];
    expect(names).not.toContain('Salt');
    expect(names.some((n) => /hashtag|music|bensound/i.test(n))).toBe(false);
    expect(names[0]).toMatch(/chicken/i);
    expect(parsed?.ingredients.some((i) => i.group === 'Garnishes')).toBe(true);
  });
});

describe('pickBetterTimedSteps', () => {
  it('keeps curated steps over noisy captions', () => {
    const curated = [
      { text: 'Dice onions', startSeconds: 18 },
      { text: 'Simmer beans', startSeconds: 120 },
    ];
    const noisy = [
      {
        text: 'Place and in my humble opinion there is a secret to a perfect bowl of chili gotta start with some…',
        startSeconds: 3,
      },
    ];
    expect(pickBetterTimedSteps(curated, noisy)).toBe(curated);
    expect(scoreTimedSteps(curated)).toBeGreaterThan(scoreTimedSteps(noisy));
  });
});

describe('captionsToTimedSteps', () => {
  it('extracts action steps from caption events', () => {
    const events = [
      {
        tStartMs: 17000,
        segs: [{ utf8: 'the first step here is to cut some onions' }],
      },
      {
        tStartMs: 81000,
        segs: [{ utf8: "once that's warmed up i'm gonna add the peppers" }],
      },
      {
        tStartMs: 118000,
        segs: [{ utf8: 'next in is one 28 ounce can of crushed tomatoes' }],
      },
    ];
    const steps = captionsToTimedSteps(events);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].startSeconds).toBe(17);
    expect(steps[0].text.toLowerCase()).toMatch(/cut|onion/);
  });
});
