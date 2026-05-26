# Recipe edits (local)

Browser-only drafts of catalog changes until pasted into Cursor and applied to `src/static-api/data/recipes.json`.

**Storage key:** `recipes-recipe-edits-v1`

---

## Shape

```json
{
  "version": 1,
  "edits": {
    "slug-here": {
      "slug": "slug-here",
      "removed": false,
      "overrides": { "title": "New title" },
      "aiNotes": { "ingredients": "Double the garlic" },
      "updatedAt": "2026-05-26T12:00:00.000Z"
    }
  }
}
```

| Field | Meaning |
| ----- | ------- |
| `removed` | Hide from recipe lists (home, tags, planner); listed under Settings → Hidden recipes; included in export `deletedRecipes` for Cursor to delete from JSON |
| `overrides` | Direct field replacements for UI preview (includes `tags`, `pairedWith` slug arrays) |
| `aiNotes` | Natural-language instructions for Cursor (`global`, `title`, `ingredients`, etc.) |

---

## Code

| Area | Path |
| ---- | ---- |
| Types + parsers | `src/features/recipe-edits/types.ts` |
| Storage | `src/features/recipe-edits/recipeEdits.ts` |
| Editor mode flag | `src/features/recipe-edits/editorMode.ts` (`recipes-editor-mode-v1`) |
| Inline field UI | `src/features/recipe-edits/EditableRecipeField.tsx` |
| Display merge | `src/features/recipe-edits/applyRecipeEdits.ts` |
| Hooks | `src/hooks/useRecipeEdits.ts`, `src/hooks/useEditorMode.ts` |
