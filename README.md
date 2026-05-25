# Recipes

Design-driven, API-driven (static JSON) recipe site. **Specs and tests before code.**

## Start here

1. **[AGENTS.md](AGENTS.md)** — stack, non-negotiables, skill index
2. **[recipes-design-first](.cursor/skills/recipes-design-first/SKILL.md)** — workflow: spec → contract → test → implement
3. **[application.md](docs/product-specs/application.md)** — refine vision if needed
4. **First feature slice:**
   - Copy [pages/TEMPLATE.md](docs/product-specs/pages/TEMPLATE.md) → `pages/recipe-list.md`
   - Copy [loaders/TEMPLATE.md](docs/api-specs/loaders/TEMPLATE.md) → `loaders/recipes-catalog.md`
   - Add rows to [feature-catalog.md](docs/feature-catalog.md)
5. Bootstrap with **[recipes-project](.cursor/skills/recipes-project/SKILL.md)** when ready to code

## Documentation

| Area | Path |
| ---- | ---- |
| Product (pages, components, services) | [docs/product-specs/](docs/product-specs/) |
| Static API (JSON + loaders) | [docs/api-specs/](docs/api-specs/) |
| Feature inventory | [docs/feature-catalog.md](docs/feature-catalog.md) |
| Code architecture | [docs/architecture.md](docs/architecture.md) |

## Cursor skills

### Workflow & docs

| Skill | Purpose |
| ----- | ------- |
| `recipes-design-first` | **Entry point** — order of work |
| `product-docs-specs` | Pages, components, services |
| `page-specs` | Per-route UX + feature IDs |
| `api-specs` | Loader/JSON contracts |
| `feature-catalog` | Every user-visible feature indexed |

### Implementation

| Skill | Purpose |
| ----- | ------- |
| `recipes-project` | Folders, bootstrap, naming |
| `recipes-tdd` | Red → green → refactor |
| `recipes-design-system` | Tokens & primitives |
| `recipes-components` | Component layers |
| `recipes-static-api` | JSON + loaders in `src/static-api/` |
| `recipes-enrich-from-url` | Scrape `sourceUrl` for ingredients, steps, images |

Always-on rule: [.cursor/rules/recipes.mdc](.cursor/rules/recipes.mdc)

## Run the app

```bash
npm install
npm run dev      # http://localhost:5173
npm run test:run
npm run build    # dist/ for static hosting
```

## Pattern source

Doc + test workflow adapted from **ScreenShotComposer** and **PhotoCollage** (`product-docs-specs`, `screen-specs` / `page-specs`, `test-driven-design`, feature tables with stable IDs and test links).
