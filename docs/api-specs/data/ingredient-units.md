# Ingredient units

Canonical unit strings for `Ingredient.unit` in `recipes.json`. Implementation: [`src/static-api/units.ts`](../../../src/static-api/units.ts).

## Rules

| Rule | Detail |
| ---- | ------ |
| **Measure units** | Use only values from `MEASURE_UNITS` (exact spelling/casing) |
| **Count-only** | `unit: ""` when the amount counts items: `1` + `` + `red onion, medium diced` |
| **Sized cans** | Put size in `unit`, food in `name`: `1` + `(28 oz) can` + `diced tomatoes` |
| **Names** | Lowercase in `name`; never put measure words in `name` when they belong in `unit` |
| **Import** | Run through `formatIngredientForCatalog()` so aliases become canonical |
| **Normalize** | `normalizeCatalogIngredients()` / `npm run normalize:ingredients` — repair `/2` amounts, move measures out of `unit`, infer `group` |
| **Sections** | Optional `group` on each ingredient; consecutive matching groups render as headings (e.g. `Garnishes`, `Chili-lime sauce`) |
| **One measure** | Never store a second unit in `name` (e.g. `(60ml)` beside `1/4 cup`, or `(700g)` beside `1/2 lb`). Pick the US-friendly `amount`/`unit`; prep notes in `name` only |
| **Salt & pepper** | Omit from `ingredients[]` — assume on hand; season in `steps` (“salt and pepper to taste”) |
| **Display** | Use `getIngredientDisplayParts()` or `formatIngredientLine()` — do not hand-join fields. **Bold** the food name in lists; link names in directions with hover card |

## Canonical measure units (`MEASURE_UNITS`)

| Unit | Use for |
| ---- | ------- |
| `tsp` | Teaspoon (always lowercase `tsp`) |
| `Tbsp` | Tablespoon (capital **T**, lowercase **bsp**) |
| `cup` | US cup (singular; never `cups` in JSON) |
| `L` | Liter (capital **L**) |
| `ml` | Milliliter |
| `oz` | Ounce |
| `lb` | Pound |
| `g` | Gram |
| `kg` | Kilogram |
| `can` | Generic can when size is in `name` or unknown |
| `clove` / `cloves` | Garlic etc. |
| `pinch` | Pinch |

## Accepted aliases (import only)

Writers and parsers may see `tablespoon`, `cups`, `TBSP`, etc. `UNIT_ALIASES` maps these to the canonical values above. **Do not store aliases in JSON.**

## Literal can units

When can size matters, store the full label in `unit`:

```json
{ "amount": "1", "unit": "(28 oz) can", "name": "diced tomatoes, fire-roasted if available" }
```

Pattern: `(number) (oz|lb) can` — optional period after oz/lb is stripped on normalize.

## Examples

| JSON | Rendered line |
| ---- | ------------- |
| `{ "amount": "2", "unit": "Tbsp", "name": "olive oil" }` | `2 Tbsp olive oil` |
| `{ "amount": "1", "unit": "tsp", "name": "paprika" }` | `1 tsp paprika` |
| `{ "amount": "1", "unit": "", "name": "poblano pepper, medium diced" }` | `1 poblano pepper, medium diced` |
| `{ "amount": "1.5", "unit": "L", "name": "chicken stock" }` | `1.5 L chicken stock` |

## API helpers

| Function | Purpose |
| -------- | ------- |
| `normalizeIngredientUnit(unit)` | Import: alias → canonical or `""` |
| `formatIngredientUnit(unit)` | Display: alias → canonical; unknown legacy values unchanged |
| `formatIngredientName(name)` | Display: lowercase food nouns |
| `getIngredientDisplayParts(ing)` | `{ amount, unit, name, line }` for UI |
| `formatIngredientLine(ing)` | Plain-text line |
| `formatIngredientForCatalog(ing)` | Normalize both fields before save |

## UI rendering

Recipe detail uses `getIngredientDisplayParts()` and renders **amount**, **unit**, and **name** as separate spans so unit casing stays visually consistent (e.g. `Tbsp` vs `tsp`).
