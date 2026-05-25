---
name: recipes-tdd
description: >-
  Test-driven development for the recipes React app. Use when adding behavior,
  fixing bugs, or the user mentions TDD, tests first, red-green-refactor, or
  Vitest/React Testing Library. Pair with page-specs and api-specs for doc-first work.
---

# Recipes TDD

**Every behavior gets a failing test before production code.** For user-visible work, add `planned` rows in page/API specs first (**recipes-design-first**).

## Order of work

1. **Product** — `planned` in `docs/product-specs/pages/` and `docs/api-specs/loaders/` when behavior is new or unclear
2. **Red** — one focused test for one observable outcome
3. **Green** — smallest change to pass
4. **Refactor** — tests stay green
5. **Verify** — targeted test run; link tests in spec **Tests** columns

## Cycle

Same as steps 2–4 above: red → green → refactor.

## What to test

| Layer | Test with | Assert |
|-------|-----------|--------|
| Loaders | Vitest (no DOM) | parsed types, errors, filters |
| Primitives / components | RTL | roles, labels, visible text, ARIA |
| Pages | RTL + MemoryRouter | user-visible outcomes after navigation |

Do **not** test implementation details (internal state, private helpers, CSS class names unless they carry semantics).

## Test file template

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeCard } from './RecipeCard';

describe('RecipeCard', () => {
  it('shows the recipe title', () => {
    render(<RecipeCard recipe={fixtureRecipe} />);
    expect(screen.getByRole('heading', { name: 'Tomato Soup' })).toBeInTheDocument();
  });
});
```

## Fixture discipline

- Shared recipe objects live in `src/test/fixtures/recipes.ts`
- Loaders use inline minimal JSON in loader tests; reuse fixtures for UI tests
- Never depend on network in unit tests — mock `fetch` or import JSON directly

## Workflow for a new UI piece

1. List behaviors in page spec Features table (`planned`, Tests: `none`)
2. Write the first test for the simplest behavior
3. Implement minimal component using **design-system primitives only**
4. Repeat until spec rows are `complete` with test links
5. Run `npm run test:run` for touched tests (full suite when shared infra changes)

## Bug fixes

1. Reproduce with a failing test
2. Fix
3. Keep the test — regression guard

## Commands

```bash
npm run test          # watch
npm run test:run      # single run / CI
npm run test -- RecipeCard  # filter
```

## Anti-patterns

- Production code without a corresponding test for new behavior
- Snapshot-only tests with no semantic assertion
- Testing third-party libraries
- Skipping loader tests because data is "just JSON"
- Shipping UI without updating page spec or feature catalog
