import { describe, expect, it } from 'vitest';
import { recipeImageUrl } from './recipeImageUrl';

describe('recipeImageUrl', () => {
  it('uses placeholder when imageUrl is empty', () => {
    expect(recipeImageUrl('')).toBe('/images/recipe-placeholder.svg');
    expect(recipeImageUrl(undefined)).toBe('/images/recipe-placeholder.svg');
  });

  it('returns trimmed url when provided', () => {
    expect(recipeImageUrl('  /img/a.jpg  ')).toBe('/img/a.jpg');
  });
});
