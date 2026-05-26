import { beforeEach, describe, expect, it } from 'vitest';
import { loadTheme, saveTheme, THEME_STORAGE_KEY } from './themeStorage';

describe('themeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to light when unset', () => {
    expect(loadTheme()).toBe('light');
  });

  it('persists the selected theme', () => {
    saveTheme('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(loadTheme()).toBe('dark');
  });

  it('falls back to light for invalid stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon');
    expect(loadTheme()).toBe('light');
  });
});
