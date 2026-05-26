# Bento planner

Browse cold, finger-friendly toddler bento ideas by compartment (snack, fruit, veggie, main, treat). Pick how many items fit your box, then add ideas into a simple “your bento” list. Recipe-light — optional links to catalog recipes when one fits.

**Route:** `/bento`
**ID prefix:** `BT-`

---

## Primary code

| Area | Path (repo-relative) |
| ---- | -------------------- |
| Route / page | `src/pages/BentoPlannerPage/BentoPlannerPage.tsx` |
| Feature UI | `src/features/bento-planner/` |

---

## Component dependencies

| Component | Spec | Role |
| --------- | ---- | ---- |
| BentoIdeaCard | — | Browse card with add + optional recipe link |
| BentoItemCountPicker | — | Choose 3–6 compartments |
| BentoBoxSummary | — | Current picks for the box |

---

## API dependencies

| Operation | Spec | Role |
| --------- | ---- | ---- |
| `getBentoIdeas` | [bento-ideas-catalog](../../api-specs/loaders/bento-ideas-catalog.md) | Catalog for browse |
| `groupBentoIdeasBySection` | bento-ideas-catalog | Section headings |

---

## Navigation & chrome

| Location | Expected controls | Notes |
| -------- | ----------------- | ----- |
| App nav | “Bento” link | Between Starred and Settings |
| Page | Title, item count, your bento, section browse | No global search integration in v1 |

---

## Decisions & spec drift

| Topic | Decision or current truth |
| ----- | ------------------------- |
| Age focus | Two-year-old friendly: finger food, no reheat, choking-safe prep called out in `tips` |
| Planner storage | `localStorage` for compartment count and selected idea slugs |
| Images | None in v1 — text cards only |

---

## Features

| # | Feature | Description | Status | Tests |
| - | ------- | ----------- | ------ | ----- |
| BT-1 | Bento route | `/bento` renders planner page | complete | [BentoPlannerPage.test.tsx](../../../src/pages/BentoPlannerPage/BentoPlannerPage.test.tsx) |
| BT-2 | Item count | User selects 3–6 items for the box | complete | BentoPlannerPage.test.tsx, bentoPlannerStorage.test.ts |
| BT-3 | Section browse | Ideas grouped snack, fruit, veggie, main, treat | complete | bentoIdeasCatalog.test.ts, BentoPlannerPage.test.tsx |
| BT-4 | Build a box | Add/remove ideas up to chosen count | complete | BentoPlannerPage.test.tsx |
| BT-5 | Recipe link | Optional link to recipe detail when `recipeSlug` set | complete | BentoPlannerPage.test.tsx |
| BT-6 | Randomize bento box | Randomize the whole box (spinner) and randomize individual filled slots | complete | BentoPlannerPage.test.tsx, randomizeBentoPicks.test.ts |

---

## Notes

Ideas sourced from common toddler bento guidance (finger foods, divided boxes, cold-safe proteins, quartered round foods). Always follow your daycare nut/allergy policy.

---

## Related specs

- [bento-ideas-schema.md](../../api-specs/data/bento-ideas-schema.md)
- [bento-ideas-catalog.md](../../api-specs/loaders/bento-ideas-catalog.md)
