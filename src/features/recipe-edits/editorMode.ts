export const EDITOR_MODE_STORAGE_KEY = 'recipes-editor-mode-v1';

export function loadEditorMode(): boolean {
  try {
    const raw = localStorage.getItem(EDITOR_MODE_STORAGE_KEY);
    if (raw === null) return false;
    return raw === 'true';
  } catch {
    return false;
  }
}

export function saveEditorMode(enabled: boolean): void {
  localStorage.setItem(EDITOR_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
}
