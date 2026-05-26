# Recipes — agent guide

React recipe site: **design-driven** product specs, **API-driven** static JSON + loaders, **design system**, **component-first** UI, **test-driven** development.

## Stack (defaults)

| Layer | Choice |
|-------|--------|
| UI | React 19 + TypeScript |
| Build | Vite |
| Tests | Vitest + React Testing Library + `@testing-library/user-event` |
| Routing | React Router (when needed) |
| Styling | CSS modules + design tokens |
| Data | Static JSON under `src/static-api/` — no runtime backend |

## Workflow (read first)

**[.cursor/skills/recipes-design-first/SKILL.md](.cursor/skills/recipes-design-first/SKILL.md)** — spec → contract → test → code.

## Documentation

| Topic | Path / skill |
|-------|----------------|
| Site vision, personas | [docs/product-specs/application.md](docs/product-specs/application.md) |
| Pages & features | [docs/product-specs/pages/](docs/product-specs/pages/) — **page-specs** |
| Loader & JSON contracts | [docs/api-specs/](docs/api-specs/) — **api-specs** |
| Feature inventory | [docs/feature-catalog.md](docs/feature-catalog.md) — **feature-catalog** |
| Code layers | [docs/architecture.md](docs/architecture.md) |

## Implementation skills

| Topic | Skill |
|-------|--------|
| Folder layout, bootstrap | [recipes-project](.cursor/skills/recipes-project/SKILL.md) |
| Red → green → refactor | [recipes-tdd](.cursor/skills/recipes-tdd/SKILL.md) |
| Tokens & primitives | [recipes-design-system](.cursor/skills/recipes-design-system/SKILL.md) |
| Component layers | [recipes-components](.cursor/skills/recipes-components/SKILL.md) |
| JSON & loaders | [recipes-static-api](.cursor/skills/recipes-static-api/SKILL.md) |
| Add/import recipe from URL | [recipes-import-recipe](.cursor/skills/recipes-import-recipe/SKILL.md) |
| Scrape non-YouTube `sourceUrl` | [recipes-enrich-from-url](.cursor/skills/recipes-enrich-from-url/SKILL.md) |
| YouTube video + timestamps | [recipes-youtube-recipe](.cursor/skills/recipes-youtube-recipe/SKILL.md) |
| Product doc hygiene | [product-docs-specs](.cursor/skills/product-docs-specs/SKILL.md) |

## Non-negotiables

1. **Specs before ambiguous code** — page + API docs with `planned` rows
2. **Tests first** — failing test before production code for every behavior
3. **Design system first** — tokens and primitives; no magic values in features
4. **Components before pages** — test leaves, then compose routes
5. **Static API only** — versioned JSON + thin tested loaders
6. **Catalog every feature** — `docs/feature-catalog.md` stays in sync

## Commands (after scaffold)

```bash
npm run test        # watch
npm run test:run    # CI
npm run lint
npm run build
```
