import { describe, expect, it } from 'vitest';
import {
  isSubstantiveServeStep,
  polishRecipeSteps,
  splitBakeAndServeStep,
} from './recipe-steps.mjs';

describe('splitBakeAndServeStep', () => {
  it('splits bake and substantive serve', () => {
    const parts = splitBakeAndServeStep(
      'Bake until fish flakes easily, about 20 minutes. Serve garnished with cilantro and lime wedges, if desired. Enjoy!',
    );
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/Bake until fish flakes/);
    expect(parts[1]).toMatch(/^Serve garnished with cilantro/i);
    expect(parts[1]).not.toMatch(/Enjoy/);
  });

  it('drops serve when it adds nothing', () => {
    const parts = splitBakeAndServeStep(
      'Simmer 10 minutes. Serve hot. Enjoy!',
    );
    expect(parts).toHaveLength(1);
    expect(parts[0]).toMatch(/Simmer 10 minutes/);
  });
});

describe('isSubstantiveServeStep', () => {
  it('accepts garnish detail', () => {
    expect(
      isSubstantiveServeStep(
        'Serve the baked tilapia garnished with cilantro, sliced chili peppers and lime wedges',
      ),
    ).toBe(true);
  });
});

describe('polishRecipeSteps', () => {
  it('applies split across all steps', () => {
    const steps = polishRecipeSteps([
      'Preheat oven to 425°F.',
      'Bake until done, about 20 minutes. Serve with sour cream and avocado. Enjoy!',
    ]);
    expect(steps).toHaveLength(3);
  });
});
