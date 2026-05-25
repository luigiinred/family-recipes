---
name: page-specs
description: Keep page specs in docs/product-specs/pages/ complete and accurate. ALWAYS read before adding, changing, or removing UI or page behavior; update feature tables and code maps in the same change.
---

# Page specs

Per-page docs in `docs/product-specs/pages/` are the **single source of truth** for:

- **Primary code** (routes, page components, layouts)
- **Component / service / API dependencies**
- **Navigation, header, actions**
- **Large subcomponents**
- **Decisions & spec drift**
- **Features** table: ID, description, functional status, **Tests** column
- **Notes** and cross-links

## Template

New page: copy [docs/product-specs/pages/TEMPLATE.md](../../../docs/product-specs/pages/TEMPLATE.md). Register in the **Page docs** table below and in `docs/product-specs/index.md`.

## Page docs

| Page | Doc path | ID prefix |
| ---- | -------- | --------- |
| *(add rows as pages are specced)* | | |

## Feature table format

```markdown
| # | Feature | Description | Status | Tests |
|---|---------|-------------|--------|-------|
| XX-1 | Feature name | Behavior only (no test links here) | complete | [`getRecipes`](../../../src/static-api/loaders/getRecipes.test.ts) |
| XX-2 | Specced only | Brief requirement | planned | none |
```

- **#**: Unique ID per prefix; never reuse deleted IDs
- **Status**: `complete` | `planned` | `not-working`
- **Tests**: `none`, or markdown links to tests and/or API spec anchors
- Escape literal `|` in cells as `\|`

## Workflow

| Step | Action |
| ---- | ------ |
| Plan | Add `planned` row; link API spec sections if server-backed |
| Build | Implement page + API together |
| Cover | Link tests in **Tests** column |
| Verify | Status `complete`; update **Decisions** if drift |
| Regress | Status `not-working` until fixed |

## Adding a new page

1. Copy `TEMPLATE.md` → `pages/<name>.md`; choose unique 2-letter prefix
2. Add row to **Page docs** table in this skill
3. Add to `pages/README.md` status table and `docs/product-specs/index.md`

Pair with **product-docs-specs** and **api-specs** for every change.
