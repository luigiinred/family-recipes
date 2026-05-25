import { describe, expect, it } from 'vitest';
import { QUICK_TAGS } from './tags';

describe('QUICK_TAGS', () => {
  it('includes vegetarian for diet filtering', () => {
    expect(QUICK_TAGS).toContain('vegetarian');
  });

  it('lists vegetarian first', () => {
    expect(QUICK_TAGS[0]).toBe('vegetarian');
  });
});
