import { beforeEach, describe, expect, it } from 'vitest';
import {
  addBentoPick,
  BENTO_ITEM_COUNT_DEFAULT,
  clampBentoItemCount,
  loadBentoItemCount,
  loadBentoPicks,
  removeBentoPick,
  saveBentoItemCount,
  saveBentoPicks,
  trimBentoPicksToCount,
} from './bentoPlannerStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('bentoPlannerStorage', () => {
  it('clamps item count between 3 and 6', () => {
    expect(clampBentoItemCount(2)).toBe(3);
    expect(clampBentoItemCount(9)).toBe(6);
    expect(clampBentoItemCount(5)).toBe(5);
  });

  it('persists item count', () => {
    saveBentoItemCount(4);
    expect(loadBentoItemCount()).toBe(4);
  });

  it('defaults item count when unset', () => {
    expect(loadBentoItemCount()).toBe(BENTO_ITEM_COUNT_DEFAULT);
  });

  it('persists picks and trims when count shrinks', () => {
    saveBentoPicks(['a', 'b', 'c', 'd', 'e']);
    expect(trimBentoPicksToCount(loadBentoPicks(), 3)).toEqual(['a', 'b', 'c']);
  });

  it('adds a pick up to max count', () => {
    expect(addBentoPick(['a'], 'b', 3)).toEqual(['a', 'b']);
    expect(addBentoPick(['a', 'b', 'c'], 'd', 3)).toEqual(['a', 'b', 'c']);
    expect(addBentoPick(['a'], 'a', 5)).toEqual(['a']);
  });

  it('removes a pick', () => {
    expect(removeBentoPick(['a', 'b'], 'a')).toEqual(['b']);
  });
});
