import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Stack, Text } from '@/design-system/primitives';
import { ThemeSettings } from '@/components/ThemeSettings/ThemeSettings';
import { DeletedRecipesList } from '@/features/recipe-edits/DeletedRecipesList';
import { SearchCategoriesSettings } from '@/features/search/SearchCategoriesSettings';
import { exportRecipeEditsForCursor, listDeletedRecipeEdits } from '@/features/recipe-edits/recipeEdits';
import { useEditorMode } from '@/hooks/useEditorMode';
import { useRecipeCatalog } from '@/hooks/useRecipeCatalog';
import { useRecipeEdits } from '@/hooks/useRecipeEdits';
import { copyToClipboard } from '@/lib/copyToClipboard';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { catalogRecipes, loading } = useRecipeCatalog();
  const { store, clearAll, restoreDeleted } = useRecipeEdits();
  const { editorMode, setEnabled } = useEditorMode();

  const catalogBySlug = useMemo(
    () => new Map(catalogRecipes.map((r) => [r.slug, r])),
    [catalogRecipes],
  );

  const deletedEdits = useMemo(() => listDeletedRecipeEdits(store), [store]);

  const exportJson = useMemo(() => {
    const payload = exportRecipeEditsForCursor(store, catalogRecipes);
    return JSON.stringify(payload, null, 2);
  }, [store, catalogRecipes]);

  const editCount = Object.keys(store.edits).length;

  const handleCopy = () => {
    void copyToClipboard(exportJson);
  };

  const handleRestore = (slug: string) => {
    const catalogRecipe = catalogBySlug.get(slug);
    if (!catalogRecipe) return;
    restoreDeleted(slug, catalogRecipe);
  };

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Link to="/" className={styles.back}>
          ← All recipes
        </Link>
        <Text as="h1" variant="title">
          Settings
        </Text>
        <Text variant="muted">
          Export pending recipe edits as JSON and paste into Cursor so the agent can update{' '}
          <code className={styles.code}>src/static-api/data/recipes.json</code>.
        </Text>
      </Stack>

      <section className={styles.section}>
        <Text as="h2" variant="subtitle">
          Appearance
        </Text>
        <ThemeSettings />
      </section>

      <section className={styles.section}>
        <Text as="h2" variant="subtitle">
          Home search categories
        </Text>
        <SearchCategoriesSettings />
      </section>

      <section className={styles.section}>
        <Text as="h2" variant="subtitle">
          Editor mode
        </Text>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={editorMode}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enable recipe editor on detail pages
        </label>
        <Text variant="muted">
          When on, open any recipe to hover and edit fields, or use Delete recipe to hide it until
          Cursor removes it from the catalog.
        </Text>
      </section>

      <section className={styles.section}>
        <Text as="h2" variant="subtitle">
          Hidden recipes (pending catalog deletion)
        </Text>
        <Text variant="muted">
          {loading
            ? 'Loading…'
            : deletedEdits.length === 0
              ? 'None hidden.'
              : `${deletedEdits.length} hidden — included in export as deletedRecipes for Cursor.`}
        </Text>
        {!loading ? (
          <DeletedRecipesList
            deletedEdits={deletedEdits}
            catalogBySlug={catalogBySlug}
            onRestore={handleRestore}
          />
        ) : null}
      </section>

      <Stack gap="sm">
        <Text as="h2" variant="subtitle">
          Pending catalog changes
        </Text>
        <Text variant="muted">
          {loading
            ? 'Loading catalog…'
            : editCount === 0
              ? 'No local edits yet. Turn on editor mode and edit or delete a recipe.'
              : `${editCount} recipe${editCount === 1 ? '' : 's'} with local edits.`}
        </Text>
      </Stack>

      <label className={styles.exportLabel}>
        Export for Cursor
        <textarea
          className={styles.exportArea}
          readOnly
          value={exportJson}
          aria-label="Recipe edits export JSON"
          rows={16}
        />
      </label>

      <Stack direction="row" gap="sm" className={styles.actions}>
        <Button type="button" onClick={() => void handleCopy()} disabled={editCount === 0}>
          Copy JSON
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (editCount === 0) return;
            if (window.confirm('Clear all local recipe edits? This cannot be undone.')) {
              clearAll();
            }
          }}
          disabled={editCount === 0}
        >
          Clear all edits
        </Button>
      </Stack>
    </Stack>
  );
}
