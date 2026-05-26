import { useCallback, useSyncExternalStore } from 'react';
import { applyTheme } from '@/design-system/theme/applyTheme';
import { loadTheme, saveTheme } from '@/design-system/theme/themeStorage';
import type { ThemeId } from '@/design-system/theme/types';

let cache = loadTheme();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ThemeId {
  return cache;
}

function setTheme(theme: ThemeId) {
  cache = theme;
  saveTheme(theme);
  applyTheme(theme);
  for (const listener of listeners) {
    listener();
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setThemeId = useCallback((next: ThemeId) => {
    setTheme(next);
  }, []);

  return { theme, setTheme: setThemeId };
}

export function resetThemeCache(): void {
  cache = loadTheme();
  applyTheme(cache);
}

export function initTheme(): ThemeId {
  const theme = loadTheme();
  applyTheme(theme);
  cache = theme;
  return theme;
}
