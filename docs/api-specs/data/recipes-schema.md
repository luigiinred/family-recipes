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
| `tags` | string[] | yes | Cuisine, diet, method |
| `ingredients` | Ingredient[] | yes | May be `[]` for bookmarks |
| `steps` | string[] | yes | Placeholder until filled in |
| `sourceUrl` | string | no | External recipe link |
| `mealLists` | MealList[] | no | Personal queue grouping |
| `notes` | string | no | e.g. "Make x2" |

## MealList

`to-make` | `to-eat` | `healthy-ideas` | `saved` | `freezer-meals`

## Ingredient

```json
{ "amount": "1", "unit": "cup", "name": "tomatoes" }
```
