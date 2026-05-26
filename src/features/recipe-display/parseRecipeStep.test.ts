import { describe, expect, it } from 'vitest';
import { formatRecipeStep, parseRecipeStep } from './parseRecipeStep';

describe('parseRecipeStep', () => {
  it('splits Uses line from instruction body', () => {
    const parsed = parseRecipeStep(
      'Uses: olive oil · red onion · poblano pepper\n\nPreheat a Dutch oven.',
    );
    expect(parsed.uses).toEqual(['olive oil', 'red onion', 'poblano pepper']);
    expect(parsed.instruction).toBe('Preheat a Dutch oven.');
  });

  it('returns full text as instruction when no Uses line', () => {
    expect(parseRecipeStep('Simmer for 10 minutes.').instruction).toBe(
      'Simmer for 10 minutes.',
    );
  });
});

describe('formatRecipeStep', () => {
  it('round-trips with parseRecipeStep', () => {
    const raw = formatRecipeStep(['paprika', 'cumin'], 'Stir and toast.');
    expect(parseRecipeStep(raw)).toEqual({
      uses: ['paprika', 'cumin'],
      instruction: 'Stir and toast.',
    });
  });
});
