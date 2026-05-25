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

## Effort

`low` | `medium` | `high`

Use `low` for quick weeknight-style recipes you want to spot in filters and cards.

## MealList

`to-make` | `to-eat` | `healthy-ideas` | `saved` | `freezer-meals`

## Ingredient

```json
{ "amount": "1", "unit": "cup", "name": "tomatoes" }
```

## TimedStep (video recipes)

```json
{ "text": "Roast vegetables", "startSeconds": 198 }
```

`startSeconds` is zero-based offset from the start of `youtubeVideoId`.
