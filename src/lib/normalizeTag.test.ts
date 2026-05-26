import { describe, expect, it } from 'vitest';
import { normalizeTag } from './normalizeTag';

describe('normalizeTag', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(normalizeTag('Slow Cooker')).toBe('slow-cooker');
  });

  it('strips invalid characters', () => {
    expect(normalizeTag('  Toddler Friendly!  ')).toBe('toddler-friendly');
  });

  it('returns empty for punctuation-only input', () => {
    expect(normalizeTag('!!!')).toBe('');
  });
});
