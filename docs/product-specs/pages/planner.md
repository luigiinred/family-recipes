# Starred cook queue

Reorderable list of starred recipes — your “what to cook next” queue. Order is persisted in browser `localStorage` alongside the starred set (`recipes-starred-v1`). `/planner` redirects to `/starred` for old bookmarks.

**Route:** `/starred`  
**ID prefix:** `PL-`

---

## Primary code

| Area | Path |
| ---- | ---- |
| Page | `src/pages/StarredPage/StarredPage.tsx` |
| Feature | `src/features/starred-queue/` |
| Shopping list | `src/features/starred-queue/shoppingList.ts`, `StarredShoppingList.tsx` |
| Star order | `src/features/starred-recipes/starredRecipes.ts` (`moveStarred`) |

---

## Decisions

| Topic | Decision |
| ----- | -------- |
| Scope | Starred catalog recipes only (no food ideas, no calendar) |
| Order | Array order in `recipes-starred-v1`; new stars append to the end |
| Reorder | Drag a row onto another row to move it |
| Plan tabs | **Queue** (cook order) and **Ingredients** (merged shopping list) |
| Shopping list | Group by ingredient name; each line shows amount + recipe used in |
| Nav | **Starred** tab replaces former **Planner** tab |
| Legacy route | `/planner` → `/starred` |

---

## Features

| ID | Feature | Status | Tests |
| -- | ------- | ------ | ----- |
| PL-1 | Starred queue list | complete | `StarredQueue.test.tsx`, `StarredPage.test.tsx` |
| PL-2 | Link to recipe from queue row | complete | `StarredQueue.test.tsx` |
| PL-3 | Drag to reorder queue | complete | `StarredQueue.test.tsx` |
| PL-4 | Unstar from queue row | complete | `StarredQueue.test.tsx` |
| PL-5 | Empty state + link to catalog | complete | `StarredQueue.test.tsx` |
| PL-9 | Ingredients shopping list tab | complete | `shoppingList.test.ts`, `StarredShoppingList.test.tsx`, `StarredPage.test.tsx` |
| PL-10 | Copy shopping list | complete | `StarredShoppingList.test.tsx` |
| PL-7 | Recipe `mealTypes` tags | complete | `mealTypes.test.ts` (catalog metadata; no queue UI) |

**Removed (v1 weekly planner):** calendar board, auto-fill week, food ideas on planner, day × meal slots.
