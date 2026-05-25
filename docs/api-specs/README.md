# API specifications (static)

**No HTTP server.** Contracts are JSON catalogs + TypeScript loaders under `src/static-api/`.

## Policy

- Markdown in `loaders/` is the source of truth for loader behavior
- JSON field changes update `data/recipes-schema.md` (when present) and affected loader specs
- Vitest tests in `src/static-api/loaders/*.test.ts` prove each **Features** row

## Layout

- [index.md](index.md)
- [loaders/](loaders/) — one file per loader module or contract group
- [data/recipes-schema.md](data/recipes-schema.md) — optional canonical JSON reference

## Cursor skills

- **api-specs** — doc workflow
- **recipes-static-api** — implementation patterns
