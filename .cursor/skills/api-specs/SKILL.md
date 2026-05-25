---
name: api-specs
description: Document static JSON and loader contracts under docs/api-specs/ before changing src/static-api/. Use when adding recipes, loaders, types, filters, or data the UI depends on; pairs with recipes-static-api, page-specs, and recipes-tdd.
---

# API specs (static API — API-driven)

This project has **no HTTP backend**. "API-driven" means **versioned JSON + typed loaders** are specified in docs before code changes.

## Layout

```text
docs/api-specs/
  index.md
  README.md
  loaders/<contract>.md    # getRecipeBySlug, catalog filters, etc.
  data/recipes-schema.md   # optional: canonical JSON field reference
```

Implementation lives in `src/static-api/` — see **recipes-static-api**.

## Loader contract spec contents

Each `loaders/*.md` must include:

- **Summary** — what UI/features achieve with this loader
- **Source** — JSON path (`src/static-api/data/...`, public URL)
- **Types** — TypeScript types (`Recipe`, etc.)
- **Operations** — function signatures, return shapes, errors
- **Validation** — required fields, slug rules, empty catalog behavior
- **Page dependencies** — links to `docs/product-specs/pages/*.md`
- **Features table** — `XX-API-n` IDs, status, **Tests** column → `src/static-api/loaders/*.test.ts`

Use [docs/api-specs/loaders/TEMPLATE.md](../../../docs/api-specs/loaders/TEMPLATE.md).

## Hard rules

1. New public loader functions are documented before merge
2. JSON shape changes update **data schema** doc and loader spec together
3. Every documented error/edge case has a loader test (or dated exception in **Decisions**)
4. Page specs list **API dependencies**; loader specs list **Page dependencies** — both sides updated

## Implementation order

1. Update loader spec (`planned`)
2. Failing Vitest loader test
3. JSON + loader implementation
4. UI/hooks consuming loader
5. Mark `complete`; link tests in spec and **feature-catalog**

## Definition of done

- Spec matches `src/static-api` behavior
- Loader tests linked from **Tests** column
- `docs/api-specs/index.md` updated
