# Weekly planner

Assign catalog recipes to day × meal slots; persisted in browser `localStorage`.

**Route:** `/planner`  
**ID prefix:** `PL-`

---

## Primary code

| Area | Path |
| ---- | ---- |
| Page | `src/pages/PlannerPage/PlannerPage.tsx` |
| Feature | `src/features/meal-planner/` |

---

## Decisions

| Topic | Decision |
| ----- | -------- |
| Week start | Monday-first column order |
| Persistence | `localStorage` key `recipes-weekly-plan-v1` |
| Mobile | Stacked day cards under 900px; grid on desktop |

---

## Features

| ID | Feature | Status | Tests |
| -- | ------- | ------ | ----- |
| PL-1 | Weekly board | complete | `weeklyPlan.test.ts` |
| PL-2 | Link to recipe from slot | complete | — |
| PL-3 | Mobile-friendly day cards | complete | — |
