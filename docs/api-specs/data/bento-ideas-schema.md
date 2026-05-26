# Bento ideas catalog JSON schema

Cold, finger-friendly toddler bento fillers — recipe-light lunch ideas grouped by compartment role. Optional `recipeSlug` links into the main recipe catalog when a full recipe fits.

## Root

```json
{ "ideas": [ BentoIdea, ... ] }
```

## BentoIdea

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `id` | string | yes | Stable numeric string |
| `slug` | string | yes | kebab-case, unique |
| `title` | string | yes | Short label in browse and planner |
| `description` | string | no | One-line prep or serving note |
| `section` | BentoSection | yes | Compartment role for browsing |
| `tips` | string | no | Safety or daycare notes (cut sizes, nut policy) |
| `recipeSlug` | string | no | Link to `/recipes/:slug` when applicable |
| `tags` | string[] | no | Facets: `no-cook`, `nut-free`, `dairy`, etc. |

## BentoSection

`snack` | `fruit` | `veggie` | `main` | `treat`

Display order matches a typical five-compartment bento: snack → fruit → veggie → main → treat.

## Source files

| File | Public copy |
| ---- | ----------- |
| `src/static-api/data/bento-ideas.json` | `public/data/bento-ideas.json` |

Synced by `npm run sync:recipes-data`.
