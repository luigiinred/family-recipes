import { useCallback, useSyncExternalStore } from 'react';
import { applyEditsToCatalog } from '@/features/recipe-edits/applyRecipeEdits';
import {
  clearAllRecipeEdits,
  clearRecipeEdit,
  getRecipeEdit,
  loadRecipeEdits,
  saveRecipeEditsStore,
  upsertRecipeEdit,
} from '@/features/recipe-edits/recipeEdits';
import {
  patchRecipeField,
  type EditableRecipeFieldName,
} from '@/features/recipe-edits/patchRecipeField';
import { patchRecipePairedWith } from '@/features/recipe-edits/patchRecipePairedWith';
import { patchRecipeTags } from '@/features/recipe-edits/patchRecipeTags';
import type { Recipe } from '@/static-api/types/recipe';
import type { RecipeAiNotes, RecipeEdit, RecipeFieldOverrides } from '@/features/recipe-edits/types';

let cache = loadRecipeEdits();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cache;
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function refreshFromStorage() {
  cache = loadRecipeEdits();
  notify();
}

function persistStore(next: typeof cache) {
  cache = next;
  saveRecipeEditsStore(next);
  notify();
}

export function useRecipeEdits() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getEdit = useCallback((slug: string) => store.edits[slug], [store]);

  const saveEdit = useCallback((edit: RecipeEdit) => {
    const next = { ...store, edits: { ...store.edits } };
    if (edit.removed || edit.overrides || edit.aiNotes) {
      next.edits[edit.slug] = { ...edit, updatedAt: new Date().toISOString() };
    } else {
      delete next.edits[edit.slug];
    }
    persistStore(next);
  }, [store]);

  const patchEdit = useCallback(
    (slug: string, patch: Partial<Omit<RecipeEdit, 'slug' | 'updatedAt'>>) => {
      upsertRecipeEdit(slug, patch);
      refreshFromStorage();
    },
    [],
  );

  const removeEdit = useCallback(
    (slug: string) => {
      clearRecipeEdit(slug);
      refreshFromStorage();
    },
    [],
  );

  const clearAll = useCallback(() => {
    clearAllRecipeEdits();
    refreshFromStorage();
  }, []);

  const mergeCatalog = useCallback(
    (recipes: Recipe[]) => applyEditsToCatalog(recipes, store.edits),
    [store],
  );

  const applyFieldPatch = useCallback(
    (
      slug: string,
      catalogRecipe: Recipe,
      field: EditableRecipeFieldName,
      value: string,
      aiNote = '',
    ) => {
      patchRecipeField(slug, catalogRecipe, store.edits[slug], field, value, aiNote);
      refreshFromStorage();
    },
    [store],
  );

  const markDeleted = useCallback(
    (slug: string, catalogRecipe: Recipe, aiNote = '') => {
      patchRecipeField(slug, catalogRecipe, store.edits[slug], 'remove', 'true', aiNote);
      refreshFromStorage();
    },
    [store],
  );

  const restoreDeleted = useCallback(
    (slug: string, catalogRecipe: Recipe) => {
      patchRecipeField(slug, catalogRecipe, store.edits[slug], 'remove', 'false', '');
      refreshFromStorage();
    },
    [store],
  );

  const applyTagsPatch = useCallback(
    (slug: string, catalogRecipe: Recipe, tags: string[]) => {
      patchRecipeTags(slug, catalogRecipe, store.edits[slug], tags);
      refreshFromStorage();
    },
    [store],
  );

  const applyPairedPatch = useCallback(
    (slug: string, catalogRecipe: Recipe, pairedSlugs: string[]) => {
      patchRecipePairedWith(slug, catalogRecipe, store.edits[slug], pairedSlugs);
      refreshFromStorage();
    },
    [store],
  );

  return {
    store,
    getEdit,
    saveEdit,
    patchEdit,
    removeEdit,
    clearAll,
    mergeCatalog,
    applyFieldPatch,
    markDeleted,
    restoreDeleted,
    applyTagsPatch,
    applyPairedPatch,
  };
}

export function resetRecipeEditsCache(): void {
  cache = loadRecipeEdits();
}

export type { RecipeEdit, RecipeFieldOverrides, RecipeAiNotes };

export { getRecipeEdit, applyEditsToCatalog };
