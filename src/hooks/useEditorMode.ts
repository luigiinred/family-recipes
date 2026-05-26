import { useCallback, useSyncExternalStore } from 'react';
import { loadEditorMode, saveEditorMode } from '@/features/recipe-edits/editorMode';

let cache = loadEditorMode();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cache;
}

function setEditorMode(enabled: boolean) {
  cache = enabled;
  saveEditorMode(enabled);
  for (const listener of listeners) {
    listener();
  }
}

export function useEditorMode() {
  const editorMode = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setEnabled = useCallback((enabled: boolean) => {
    setEditorMode(enabled);
  }, []);

  const toggle = useCallback(() => {
    setEditorMode(!cache);
  }, []);

  return { editorMode, setEnabled, toggle };
}

export function resetEditorModeCache(): void {
  cache = loadEditorMode();
}
