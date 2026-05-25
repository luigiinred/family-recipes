# Recipes — application product spec

## What it is

**Recipes** is a personal, AI-assisted family cookbook published on the web. It is a directory of every recipe you actually cook, backed by a documented static JSON API and a mobile-responsive React UI. You add recipes by sharing URLs or text with Cursor; the agent normalizes them into versioned JSON, downloads hero images when possible, and ships them through git. The site is public on the internet with no login; only you and your family are expected to use it.

**AI-first (development):** Intelligence lives in the repo workflow (import, specs, tests, JSON)—not in an on-site chat or LLM API for v1.

## Who it is for

| Persona | Needs |
| ------- | ----- |
| **Primary (you)** | Import recipes from the web, tag and search them, scale servings while cooking, plan the week on a board, print recipes |
| **Family** | Browse and open recipes on phone or desktop; same catalog, no accounts |

## Core user journeys

1. **Discover** — Open home, search full text (title, description, ingredients, steps), or browse/filter by tags with autocomplete.
2. **Cook** — Open recipe detail, scale servings, follow steps, open print-friendly view, follow `sourceUrl` back to the original site.
3. **Import (dev)** — Paste a recipe URL or raw text in Cursor → agent produces JSON + image under `src/static-api/data/`, with required `sourceUrl` and tests.
4. **Plan the week** — On the weekly board, assign saved recipes to day/slot (breakfast, lunch, dinner); plan persists in **browser localStorage** on that device.
5. **Maintain** — Edit recipe data only in repo JSON via Cursor/git (no in-browser editor in v1).

## Product principles

- **Design-driven** — Page specs in `docs/product-specs/pages/` define UX before ambiguous UI ships.
- **API-driven** — `docs/api-specs/endpoints/` and static loaders define contracts before UI depends on them.
- **Test-driven** — Contract and unit tests prove specs; see `.cursor/skills/test-driven-design/`.
- **Catalog truth in git** — Recipes and tags materialize as versioned JSON; the live site reads loaders, not a database.
- **Tags grow with use** — Tags are freeform strings on each recipe; the UI suggests existing tags (autocomplete) and makes creating new tags obvious.
- **Family-scale, not product-scale** — Optimize for a few users and honest workflows, not multi-tenant SaaS.

## Non-goals (initial)

- On-site AI import UI or server-side LLM calls in v1
- User accounts, login, or per-family permissions
- Server-backed meal plan sync across devices (planner uses localStorage in v1)
- In-browser recipe editing
- Nutrition as a required field (optional when import provides it)
- Offline / PWA (mobile-responsive web only)
- Dedicated hosting vendor (stay host-agnostic until chosen)
- Shopping-list generation from the meal plan (weekly board only in v1)
- Metric/imperial unit conversion (servings scale only)

## Platform and stack

| Layer | Choice | Notes |
| ----- | ------ | ----- |
| Web UI | React 19 + TypeScript + Vite | Component-first; design tokens; CSS modules |
| API | Static JSON + typed loaders | Documented like HTTP in `docs/api-specs/`; no runtime backend |
| Data | `src/static-api/data/*.json` | Recipes catalog; tags derived or indexed for autocomplete |
| Meal plan | `localStorage` | Per-browser weekly board; document key schema in a service spec |
| Auth | None | Public URL; unlisted/obscure link acceptable |
| Images | Required per recipe | `imageUrl` pointing at repo `public/` assets; Cursor agent downloads from source when possible |
| Hosting | TBD | Static deploy of built app + assets |

## Domain model (product-level)

### Recipe (catalog)

- Identity: `id`, `slug`, `title`, `description`
- Media: `imageUrl` (required)
- Source: `sourceUrl` (required for imports)
- Time & yield: `prepMinutes`, `cookMinutes`, `servings`
- Content: `ingredients[]`, `steps[]`
- Classification: `tags[]` (freeform strings)
- Optional: nutrition fields when available from import

### Tags

- Stored on each recipe; autocomplete built from union of tags in catalog (and/or a lightweight registry file if needed later).
- Examples you care about: `breakfast`, `lunch`, `dinner`, healthy options, `toddler-friendly`, plus any tag you invent later.

### Weekly meal plan (client-only v1)

- Board: days × meal slots (breakfast, lunch, dinner)
- Cells reference recipe `id` or `slug`
- Persisted in `localStorage`; **not shared across family devices** unless you later move plans to static JSON or a backend

## v1 pages (to spec under `docs/product-specs/pages/`)

| Route / page | Purpose |
| ------------ | ------- |
| Home | Recipe grid, **full-text search bar**, entry to catalog |
| Recipe detail | Ingredients, steps, servings scaler, source link, print |
| Tags browse | Filter/list by tag; tag discovery with autocomplete patterns |
| Weekly planner | Assign recipes to day/slot; localStorage persistence |

Search is **on home**, not a separate route in v1.

## AI-assisted import workflow (v1)

1. You provide a recipe URL or pasted text to Cursor.
2. Agent extracts structured fields matching the JSON schema, sets `sourceUrl`, assigns sensible `tags`, and generates `slug`.
3. Agent attempts to download a hero image into `public/` and sets `imageUrl`; if download fails, block import or use an explicit placeholder policy (decide in import service spec).
4. Agent adds/updates JSON, loader tests, and product/API spec links as needed.
5. You deploy static build; family sees the new recipe.

## Resolved v1 decisions

| Topic | Decision |
| ----- | -------- |
| Planner | Monday-first week; empty slot = “—”; localStorage per browser |
| Images | `/images/recipe-placeholder.svg` when `imageUrl` empty; external URLs kept when set |
| Search | Runtime filter over bundled JSON via `filterRecipes` / `searchRecipes` |
| Print | Hide nav/toolbar; show hero + content |
| Family planner sync | Deferred — localStorage only in v1 |

## Development

```bash
npm run test      # watch
npm run test:run  # CI
npm run lint
npm run build
```

## Related docs

- [Product index](index.md)
- [Architecture](../architecture.md)
- [Feature catalog](../feature-catalog.md) *(create when first features are registered)*
- Cursor: `.cursor/skills/recipes-design-first/`
