import { describe, expect, it } from 'vitest';
import { mergeCategoryNavFilters } from './mergeCategoryNavFilters';

describe('mergeCategoryNavFilters', () => {
  it('merges category tags with nav tags', () => {
    expect(
      mergeCategoryNavFilters(
        { tags: ['family'] },
        { query: '', tags: ['soup'], mealList: undefined, lowEffortOnly: false },
      ),
    ).toEqual({
      tags: ['family', 'soup'],
    });
  });

  it('lets nav meal list override category meal list', () => {
    expect(
      mergeCategoryNavFilters(
        { mealList: 'saved' },
        { query: '', tags: [], mealList: 'to-make', lowEffortOnly: false },
      ),
    ).toEqual({
      mealList: 'to-make',
    });
  });

  it('uses category meal type and nav low effort', () => {
    expect(
      mergeCategoryNavFilters(
        { mealType: 'dinner' },
        { query: 'pasta', tags: [], mealList: undefined, lowEffortOnly: true },
      ),
    ).toEqual({
      query: 'pasta',
      mealType: 'dinner',
      effort: 'low',
    });
  });
});
