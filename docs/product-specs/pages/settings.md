# Settings

Export local recipe edits as JSON for Cursor to apply to the static catalog.

**Route:** `/settings`  
**ID prefix:** `ST-`

---

## Primary code

| Area | Path |
| ---- | ---- |
| Page | `src/pages/SettingsPage/SettingsPage.tsx` |
| Edits storage | `src/features/recipe-edits/recipeEdits.ts` |

---

## Service dependencies

| Service | Spec | Role |
| ------- | ---- | ---- |
| Recipe edits | *(this page)* | `localStorage` key `recipes-recipe-edits-v1` |

---

## Navigation & chrome

| Location | Expected controls | Notes |
| -------- | ----------------- | ----- |
| App header | Settings (gear) link | Navigates to `/settings` |

---

## Features

| ID | Feature | Status | Tests |
| -- | ------- | ------ | ----- |
| ST-1 | Settings nav | Gear link in app header | complete | — |
| ST-2 | Export JSON | Read-only textarea of all pending edits with catalog titles | complete | [SettingsPage.test.tsx](../../../src/pages/SettingsPage/SettingsPage.test.tsx) |
| ST-3 | Copy export | Copy JSON to clipboard | complete | SettingsPage.test.tsx |
| ST-4 | Clear all edits | Remove all local drafts after confirm | complete | — |
| ST-5 | Editor mode toggle | Enable hover-to-edit on recipe detail pages | complete | [SettingsPage.test.tsx](../../../src/pages/SettingsPage/SettingsPage.test.tsx), [EditableRecipeField.test.tsx](../../../src/features/recipe-edits/EditableRecipeField.test.tsx) |
| ST-6 | Hidden recipes | List locally deleted recipes; restore before export | complete | SettingsPage.test.tsx |
| ST-7 | Search categories | Add, rename, remove, and configure default filters per home tab | complete | `SearchCategoriesSettings.test.tsx`, `searchCategories.test.ts` |
| ST-8 | Theme | Light, dark, or classic (original family site) appearance | complete | [ThemeSettings.test.tsx](../../../src/components/ThemeSettings/ThemeSettings.test.tsx), [themeStorage.test.ts](../../../src/design-system/theme/themeStorage.test.ts) |
