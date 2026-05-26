import { describe, expect, it } from 'vitest';
import { decodePlanRef, encodePlanRef, isFoodIdeaPlanRef } from './planRef';

describe('planRef', () => {
  it('encodes recipe slugs without a prefix', () => {
    expect(encodePlanRef({ kind: 'recipe', slug: 'briam' })).toBe('briam');
  });

  it('encodes food ideas with idea: prefix', () => {
    expect(encodePlanRef({ kind: 'idea', slug: 'takeout-pizza' })).toBe(
      'idea:takeout-pizza',
    );
  });

  it('decodes legacy recipe slugs', () => {
    expect(decodePlanRef('briam')).toEqual({ kind: 'recipe', slug: 'briam' });
  });

  it('decodes food idea refs', () => {
    expect(decodePlanRef('idea:chips-and-dip')).toEqual({
      kind: 'idea',
      slug: 'chips-and-dip',
    });
  });

  it('detects idea refs', () => {
    expect(isFoodIdeaPlanRef('idea:takeout')).toBe(true);
    expect(isFoodIdeaPlanRef('briam')).toBe(false);
  });
});
