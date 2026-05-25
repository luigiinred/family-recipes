---
name: product-docs-specs
description: Keep product docs current for pages, components, and services under docs/product-specs/. ALWAYS use before adding, changing, or removing user-visible behavior, reusable UI, or background product behavior; update specs, dependency tables, and folder README status rollups in the same change.
---

# Product docs specs

Use this skill for any user-visible change on the Recipes site:

- page behavior, flows, navigation, layout
- reusable component additions or behavior changes
- shared UI patterns or terminology
- **cross-cutting services** (auth, search indexing, imports, notifications)

## Layout

- **Application:** `docs/product-specs/application.md` — site-wide intent, personas, principles
- **Pages:** `docs/product-specs/pages/` — one `.md` per route; entry **`pages/README.md`**
- **Components:** `docs/product-specs/components/` — shared UI; entry **`components/README.md`**
- **Services:** `docs/product-specs/services/` — behavior spanning multiple pages; entry **`services/README.md`**
- **Index:** `docs/product-specs/index.md`

## API linkage

When a page feature uses loaders or JSON, add **API dependencies** on the page spec (links to `docs/api-specs/loaders/*.md`). Update the loader spec's **Page dependencies** in the same change. See **api-specs** and **recipes-static-api** skills.

## Status vocabulary

Use **`planned`**, **`complete`**, and **`broken`** in each folder's `README.md` status table.

- Per-page **Features** tables may use `not-working` (= broken at row level).

## Dependency tables

### Page specs

- **Component dependencies** — link to `../components/<name>.md` or state none
- **Service dependencies** — link to `../services/<name>.md` when applicable
- **API dependencies** — link to `../../api-specs/endpoints/<name>.md` for each endpoint the page uses

### Component specs

- **Page dependencies**, **Component dependencies**, **Service dependencies**, **API dependencies** (when the component triggers API calls directly)

### Service specs

- **Page dependencies**, **Component dependencies**, **API dependencies**
- Affected pages/components link back when product-significant

## Required workflow

1. **Plan in docs** — `planned` rows and dependency tables before ambiguous implementation
2. **Implement**
3. **Finalize** — `complete` / `broken`; refresh README tables; reconcile links both ways

## Definition of done

- Specs reflect shipped behavior
- Dependency tables match the code graph
- README status tables match reality
- `index.md` links new top-level docs
