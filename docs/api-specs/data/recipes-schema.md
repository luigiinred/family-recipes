# Recipe catalog JSON schema

## Root

```json
{ "recipes": [ Recipe, ... ] }
```

## Recipe

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `id` | string | yes | Stable numeric string |
| `slug` | string | yes | kebab-case, unique |
| `title` | string | yes | |
| `description` | string | yes | |
| `imageUrl` | string | yes | Empty until images added |
| `prepMinutes` | number | yes | `0` when unknown |
| `cookMinutes` | number | yes | `0` when unknown |
| `servings` | number | yes | Default `4` |
| `tags` | string[] | yes | Cuisine, diet, method (e.g. `vegetarian`) |
| `mealTypes` | MealType[] | no | Planner slots: `breakfast`, `lunch`, `dinner`, `side`, `snack`, `dessert`. Run `npm run tag:meal-types` after bulk imports. |

Home quick-tag chips use the curated list in `src/static-api/tags.ts` (`QUICK_TAGS`), which includes `vegetarian` first.
| `ingredients` | Ingredient[] | yes | May be `[]` for bookmarks |
| `steps` | string[] | yes | Placeholder until filled in |
| `recipeKind` | `"standard"` \| `"youtube"` | no | Default standard; `youtube` enables video UI |
| `youtubeVideoId` | string | when youtube | 11-char id from YouTube URL |
| `timedSteps` | TimedStep[] | when youtube | `{ text, startSeconds }` jump targets |
| `sourceUrl` | string | no | External recipe link |
| `mealLists` | MealList[] | no | Personal queue grouping |
| `notes` | string | no | e.g. "Make x2" |
| `effort` | Effort | no | `low` \| `medium` \| `high` — omit when not classified |
| `pairedWith` | string[] | no | Slugs of other catalog recipes often served with this one (e.g. cheese bread + chili) |

## Effort

`low` | `medium` | `high`

Use `low` for quick weeknight-style recipes you want to spot in filters and cards.

## MealList

`to-make` | `to-eat` | `healthy-ideas` | `saved` | `freezer-meals`

## MealType

`breakfast` | `lunch` | `dinner` | `side` | `snack` | `dessert`

Used by the weekly planner and `src/static-api/mealTypes.ts`. Every catalog recipe should have `mealTypes` set (see **recipes-meal-planner** skill).

## Ingredient

```json
{ "amount": "1", "unit": "cup", "name": "tomatoes", "group": "Garnishes" }
```

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `amount` | string | yes | Empty when the line is prose-only |
| `unit` | string | yes | Canonical measure, sized can label, or `""` — see [ingredient-units.md](ingredient-units.md) |
| `name` | string | yes | Food item; prep notes in parentheses OK |
| `group` | string | no | Section heading for UI (e.g. `Garnishes`). Omit standalone salt — assumed on hand. |

**Units & display:** Define units with `MEASURE_UNITS` in `src/static-api/units.ts`. Render with `getIngredientDisplayParts()` / `formatIngredientLine()` — never ad-hoc string joins.

## Step text (`steps[]` and `timedSteps[].text`)

Optional **Uses** line, then a blank line, then the instruction:

```text
Uses: olive oil · paprika · cumin

Stir in the spices and toast until aromatic.
```

The detail page renders the Uses line as chips above the instruction.

## TimedStep (video recipes)

```json
{ "text": "Roast vegetables", "startSeconds": 198 }
```

`startSeconds` is zero-based offset from the start of `youtubeVideoId`.
