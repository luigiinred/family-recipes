import { isThemeId, type ThemeId } from './types';

export const THEME_STORAGE_KEY = 'recipes-theme-v1';

export function loadTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === null) return 'light';
    return isThemeId(raw) ? raw : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeId): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
