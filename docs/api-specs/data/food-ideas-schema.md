# Food ideas catalog JSON schema

Lightweight meal options that are not full recipes — takeout, pantry snacks, kid-friendly bites, leftovers. Searchable on home and assignable on the weekly planner.

## Root

```json
{ "ideas": [ FoodIdea, ... ] }
```

## FoodIdea

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `id` | string | yes | Stable numeric string |
| `slug` | string | yes | kebab-case, unique within ideas catalog |
| `title` | string | yes | Short label shown in search and planner |
| `description` | string | no | One-line context (e.g. “usual pizza spot”) |
| `imageUrl` | string | no | Card hero image; local path under `/images/ideas/` or remote URL |
| `tags` | string[] | yes | Search facets: `takeout`, `kid-friendly`, `pantry`, `no-cook`, etc. |
| `mealTypes` | MealType[] | yes | Planner slots — same values as recipes |
| `ideaKind` | IdeaKind | no | Grouping for filters and UI badges |

## IdeaKind

`takeout` | `pantry` | `leftovers` | `kid` | `other`

## MealType

Same as [recipes-schema.md](recipes-schema.md): `breakfast`, `lunch`, `dinner`, `side`, `snack`, `dessert`.

## Planner storage

Weekly plan cells store a **plan reference** string:

| Entry | Stored value |
| ----- | ------------ |
| Recipe | `slug` (unchanged for backward compatibility) |
| Food idea | `idea:<slug>` |

See `src/static-api/planRef.ts`.

## Source files

| File | Public copy |
| ---- | ----------- |
| `src/static-api/data/food-ideas.json` | `public/data/food-ideas.json` |

Synced by `npm run sync:recipes-data`.
