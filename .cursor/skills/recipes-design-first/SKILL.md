---
name: recipes-design-first
description: Entry point for Recipes — design docs, static API contracts, design system, component-first UI, and TDD. Use when starting work, planning features, writing specs, or onboarding to this repo.
---

# Recipes — design-first workflow

**Product specs → API/data contracts → failing tests → code.** Modeled on ScreenShotComposer / PhotoCollage doc-driven development, adapted for this React + static JSON app.

## Skill map

| Concern | Skill |
| ------- | ----- |
| **This workflow** | `recipes-design-first` (you are here) |
| **Product docs** | `product-docs-specs`, `page-specs`, `feature-catalog` |
| **Data contracts** | `api-specs` (loaders + JSON), `recipes-static-api` |
| **Import recipe from URL** | `recipes-import-recipe` |
| **Scrape non-YouTube URLs** | `recipes-enrich-from-url` |
| **YouTube video recipes** | `recipes-youtube-recipe` |
| **Implementation** | `recipes-project`, `recipes-components`, `recipes-design-system` |
| **Tests** | `recipes-tdd` |

## Order of work (every feature)

1. **Application** — `docs/product-specs/application.md` if vision/personas change
2. **Page spec** — `planned` row in `docs/product-specs/pages/<page>.md`
3. **API/data spec** — loader + JSON contract in `docs/api-specs/` (see **api-specs**)
4. **Catalog** — row in `docs/feature-catalog.md`
5. **Red** — loader test and/or RTL test (**recipes-tdd**)
6. **Green** — static-api → components → page (**recipes-project**)
7. **Finalize docs** — `complete`, bidirectional links, README rollups

## Documentation layout

```text
docs/
  product-specs/     # pages, components, services
  api-specs/         # JSON + loader contracts (not HTTP)
  feature-catalog.md # roll-up index
  architecture.md    # code layers
```

## Stack reminder

React 19 + Vite + Vitest + RTL. Data: `src/static-api/` only — see **recipes-static-api** and [AGENTS.md](../../../AGENTS.md).

## Greenfield next steps

1. Fill [application.md](../../../docs/product-specs/application.md)
2. Copy [pages/TEMPLATE.md](../../../docs/product-specs/pages/TEMPLATE.md) → first page (e.g. `recipe-list.md`, prefix `RL-`)
3. Copy [api-specs/loaders/TEMPLATE.md](../../../docs/api-specs/loaders/TEMPLATE.md) → e.g. `recipes-catalog.md`
4. Bootstrap app per **recipes-project** checklist
5. Implement first vertical slice with **recipes-tdd**

## Definition of done

- Page + loader specs updated; feature catalog row linked
- Tests linked from spec **Tests** columns
- No ad-hoc styles in features (**recipes-design-system**)
- `npm run test:run` green for touched tests
