---
name: feature-catalog
description: Maintain a complete inventory of user-visible features across page and API specs. Use when adding features, auditing documentation coverage, or the user asks to document every feature.
---

# Feature catalog

Every **user-visible** capability must appear in exactly one authoritative feature table, with stable IDs and traceable tests.

## Sources of truth

| Catalog file | Aggregates |
| ------------ | ---------- |
| `docs/product-specs/pages/*.md` | Page feature rows (`XX-n`) |
| `docs/api-specs/endpoints/*.md` | API feature rows (`XX-API-n`) |
| `docs/product-specs/services/*.md` | Service rows when cross-cutting |
| `docs/feature-catalog.md` | **Roll-up index** — links only, no duplicate prose |

## `docs/feature-catalog.md` rules

- One table row per **shipped or planned** user-facing feature
- Columns: **ID**, **Name**, **User outcome**, **Status**, **Page spec**, **API spec**, **Tests**
- Status: `planned` | `complete` | `broken`
- Do not invent features here — add the row on the page/API spec first, then register in the catalog

## Workflow when adding a feature

1. Add row to owning **page** spec Features table (`planned`)
2. If server-backed, add matching **API** feature row and link from page **API dependencies**
3. Add catalog roll-up row in `docs/feature-catalog.md`
4. Implement + tests per **test-driven-design**
5. Set all three statuses to `complete` and fill **Tests** links

## Audit checklist

Run before a release or when the user asks "is everything documented?":

- [ ] Every route in the app has a `pages/<name>.md` (or explicit "deferred" in application.md)
- [ ] Every public HTTP route has an `endpoints/*.md` section
- [ ] No `planned` row older than the sprint without a **Decisions** note
- [ ] `feature-catalog.md` has no orphan IDs (every ID exists in a page or API spec)
- [ ] No user-visible feature without a catalog row
- [ ] Broken features marked `not-working` / `broken` in specs and catalog

## Removing a feature

Delete the feature row from the page/API spec; remove the catalog row; do not reuse the ID.
