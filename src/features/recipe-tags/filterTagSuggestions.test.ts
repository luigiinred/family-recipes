import { describe, expect, it } from 'vitest';
import { filterTagSuggestions } from './filterTagSuggestions';

describe('filterTagSuggestions', () => {
  const catalog = ['soup', 'slow-cooker', 'vegetarian', 'chicken'];

  it('excludes tags already on the recipe', () => {
    expect(filterTagSuggestions(catalog, '', ['soup'])).toEqual([
      'chicken',
      'slow-cooker',
      'vegetarian',
    ]);
  });

  it('filters by query substring', () => {
    expect(filterTagSuggestions(catalog, 'slow', [])).toEqual(['slow-cooker']);
  });
});
