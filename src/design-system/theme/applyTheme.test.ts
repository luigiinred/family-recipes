import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyTheme } from './applyTheme';

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('sets data-theme on the document element', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    applyTheme('classic');
    expect(document.documentElement.getAttribute('data-theme')).toBe('classic');

    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
