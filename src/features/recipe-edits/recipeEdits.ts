import type { Recipe } from '@/static-api/types/recipe';
import type {
  CursorRecipeEditsExport,
  DeletedRecipeExport,
  RecipeAiNotes,
  RecipeEdit,
  RecipeEditsStore,
  RecipeFieldOverrides,
} from './types';
import { STORAGE_KEY } from './types';

export type RecipeEditWithCatalog = RecipeEdit & {
  catalogTitle?: string;
};

export type CursorRecipeEditsExportWithCatalog = Omit<
  CursorRecipeEditsExport,
  'edits' | 'deletedRecipes'
> & {
  edits: RecipeEditWithCatalog[];
  deletedRecipes: DeletedRecipeExport[];
};

function emptyStore(): RecipeEditsStore {
  return { version: 1, edits: {} };
}

function isNonEmptyString(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasOverrides(overrides?: RecipeFieldOverrides): boolean {
  if (!overrides) return false;
  if (isNonEmptyString(overrides.title)) return true;
  if (isNonEmptyString(overrides.description)) return true;
  if (isNonEmptyString(overrides.notes)) return true;
  if (overrides.ingredients && overrides.ingredients.length > 0) return true;
  if (overrides.steps && overrides.steps.length > 0) return true;
  if (overrides.timedSteps && overrides.timedSteps.length > 0) return true;
  if (overrides.tags !== undefined) return true;
  if (overrides.pairedWith !== undefined) return true;
  return false;
}

function hasAiNotes(aiNotes?: RecipeAiNotes): boolean {
  if (!aiNotes) return false;
  return Object.values(aiNotes).some((note) => isNonEmptyString(note));
}

export function isEditEmpty(edit: RecipeEdit): boolean {
  if (edit.removed) return false;
  return !hasOverrides(edit.overrides) && !hasAiNotes(edit.aiNotes);
}

export function loadRecipeEdits(): RecipeEditsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('edits' in parsed) ||
      typeof (parsed as RecipeEditsStore).edits !== 'object'
    ) {
      return emptyStore();
    }
    return parsed as RecipeEditsStore;
  } catch {
    return emptyStore();
  }
}

export function saveRecipeEditsStore(store: RecipeEditsStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveRecipeEdit(edit: RecipeEdit): void {
  const store = loadRecipeEdits();
  if (isEditEmpty(edit)) {
    delete store.edits[edit.slug];
  } else {
    store.edits[edit.slug] = edit;
  }
  saveRecipeEditsStore(store);
}

export function upsertRecipeEdit(
  slug: string,
  patch: Partial<Omit<RecipeEdit, 'slug' | 'updatedAt'>>,
): RecipeEdit {
  const store = loadRecipeEdits();
  const existing = store.edits[slug];
  const next: RecipeEdit = {
    slug,
    removed: patch.removed !== undefined ? patch.removed : existing?.removed,
    overrides: { ...existing?.overrides, ...patch.overrides },
    aiNotes: { ...existing?.aiNotes, ...patch.aiNotes },
    updatedAt: new Date().toISOString(),
  };
  saveRecipeEdit(next);
  return next;
}

export function clearRecipeEdit(slug: string): void {
  const store = loadRecipeEdits();
  delete store.edits[slug];
  saveRecipeEditsStore(store);
}

export function getRecipeEdit(slug: string): RecipeEdit | undefined {
  return loadRecipeEdits().edits[slug];
}

export function listRecipeEdits(): RecipeEdit[] {
  return Object.values(loadRecipeEdits().edits);
}

export function listDeletedRecipeEdits(store: RecipeEditsStore): RecipeEdit[] {
  return Object.values(store.edits).filter((edit) => edit.removed);
}

export function exportRecipeEditsForCursor(
  store: RecipeEditsStore,
  catalog: Recipe[],
): CursorRecipeEditsExportWithCatalog {
  const bySlug = new Map(catalog.map((r) => [r.slug, r]));
  const edits: RecipeEditWithCatalog[] = Object.values(store.edits).map((edit) => ({
    ...edit,
    catalogTitle: bySlug.get(edit.slug)?.title,
  }));
  edits.sort((a, b) => a.slug.localeCompare(b.slug));

  const deletedRecipes: DeletedRecipeExport[] = listDeletedRecipeEdits(store)
    .map((edit) => ({
      slug: edit.slug,
      catalogTitle: bySlug.get(edit.slug)?.title,
      aiNote: edit.aiNotes?.remove,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return {
    exportedAt: new Date().toISOString(),
    purpose:
      'Paste into Cursor to apply pending recipe catalog changes. Remove every slug in deletedRecipes from src/static-api/data/recipes.json (then run npm run sync:recipes-data). Use overrides for direct field updates and aiNotes for natural-language instructions.',
    targetFile: 'src/static-api/data/recipes.json',
    deletedRecipes,
    edits,
  };
}

export function clearAllRecipeEdits(): void {
  saveRecipeEditsStore(emptyStore());
}
