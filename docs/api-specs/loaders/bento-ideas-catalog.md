# Bento ideas catalog loader

**Module:** `src/static-api/loaders/loadBentoIdeasCatalog.ts`, `getBentoIdeas.ts`, `getBentoIdeaBySlug.ts`, `groupBentoIdeasBySection.ts`
**ID prefix:** `BT-API-`

---

## Summary

Load toddler-friendly cold bento fillers for the bento planner page. Ideas are grouped by `section` for browse UI.

---

## Data source

| Artifact | Path |
| -------- | ---- |
| Canonical JSON | `src/static-api/data/bento-ideas.json` |
| Public URL | `/data/bento-ideas.json` |

Schema: [bento-ideas-schema.md](../data/bento-ideas-schema.md)

---

## Operations

| ID | Function | Returns | Notes |
| -- | -------- | ------- | ----- |
| BT-API-1 | `getBentoIdeas()` | `Promise<BentoIdea[]>` | Full catalog |
| BT-API-2 | `getBentoIdeaBySlug(slug)` | `Promise<BentoIdea \| undefined>` | Single idea |
| BT-API-3 | `groupBentoIdeasBySection(ideas)` | `Record<BentoSection, BentoIdea[]>` | Stable section order |
| BT-API-4 | `loadBentoIdeasCatalog()` | `Promise<BentoIdea[]>` | Cached import |

---

## Tests

- [`bentoIdeasCatalog.test.ts`](../../../src/static-api/loaders/bentoIdeasCatalog.test.ts)
