import { beforeEach, describe, expect, it } from 'vitest';
import {
  EDITOR_MODE_STORAGE_KEY,
  loadEditorMode,
  saveEditorMode,
} from './editorMode';

describe('editorMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to off', () => {
    expect(loadEditorMode()).toBe(false);
  });

  it('persists enabled state', () => {
    saveEditorMode(true);
    expect(localStorage.getItem(EDITOR_MODE_STORAGE_KEY)).toBe('true');
    expect(loadEditorMode()).toBe(true);
  });
});
