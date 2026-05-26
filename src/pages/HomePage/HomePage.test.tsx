import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RecipeFilterProvider,
  useRecipeFilters,
} from '@/features/search/RecipeFilterContext';
import { NavRecipeSearch } from '@/components/NavRecipeSearch/NavRecipeSearch';
import { saveSearchCategories } from '@/features/search/searchCategories';
import { resetSearchCategoriesCache } from '@/hooks/useSearchCategories';
import { HomePage } from './HomePage';

vi.mock('@/hooks/useFoodIdeas', () => ({
  useFoodIdeas: () => ({
    ideas: [
      {
        id: '10',
        slug: 'takeout-pizza',
        title: 'Takeout pizza',
        tags: ['takeout'],
        mealTypes: ['dinner'],
        ideaKind: 'takeout',
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useRecipeCatalog', () => ({
  useRecipeCatalog: () => ({
    recipes: [
      {
        id: '1',
        slug: 'tomato-soup',
        title: 'Tomato Soup',
        description: '',
        imageUrl: '',
        prepMinutes: 0,
        cookMinutes: 0,
        servings: 4,
        tags: ['soup'],
        mealTypes: ['dinner'],
        ingredients: [],
        steps: [],
      },
      {
        id: '2',
        slug: 'salad',
        title: 'Green Salad',
        description: '',
        imageUrl: '',
        prepMinutes: 0,
        cookMinutes: 0,
        servings: 2,
        tags: ['salad', 'dessert'],
        mealTypes: ['dessert'],
        ingredients: [],
        steps: [],
        effort: 'low',
      },
    ],
    loading: false,
    error: null,
  }),
}));

function renderHome(options?: { nav?: boolean; filters?: React.ReactNode }) {
  return render(
    <MemoryRouter>
      <RecipeFilterProvider>
        {options?.nav ? <NavRecipeSearch /> : null}
        {options?.filters}
        <HomePage />
      </RecipeFilterProvider>
    </MemoryRouter>,
  );
}

function FilterProbe() {
  const { setQuery, setLowEffortOnly } = useRecipeFilters();
  return (
    <>
      <button type="button" onClick={() => setQuery('tomato')}>
        set tomato query
      </button>
      <button type="button" onClick={() => setLowEffortOnly(true)}>
        low effort on
      </button>
    </>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetSearchCategoriesCache();
  });

  it('shows only the recipe grid without inline search controls', () => {
    renderHome();
    expect(screen.queryByRole('complementary', { name: /catalog options/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tomato soup/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /green salad/i })).toBeInTheDocument();
  });

  it('hides food ideas until Quick ideas is enabled in nav filters', async () => {
    const user = userEvent.setup();
    renderHome({ nav: true });
    expect(screen.queryByRole('heading', { name: /takeout pizza/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('searchbox', { name: /search text/i }));
    await user.click(screen.getByRole('button', { name: 'Quick ideas' }));
    expect(screen.getByRole('heading', { name: /takeout pizza/i })).toBeInTheDocument();
  });

  it('filters recipes when a tag on a card is clicked', async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole('button', { name: 'Filter by soup' }));
    expect(screen.getByRole('link', { name: /tomato soup/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /green salad/i })).not.toBeInTheDocument();
  });

  it('filters recipes from shared filter state', async () => {
    const user = userEvent.setup();
    renderHome({ filters: <FilterProbe /> });
    await user.click(screen.getByRole('button', { name: 'set tomato query' }));
    expect(screen.getByRole('link', { name: /tomato soup/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /green salad/i })).not.toBeInTheDocument();
  });

  it('filters to low-effort recipes from shared filter state', async () => {
    const user = userEvent.setup();
    renderHome({ filters: <FilterProbe /> });
    await user.click(screen.getByRole('button', { name: 'low effort on' }));
    expect(screen.getByRole('link', { name: /green salad/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /tomato soup/i })).not.toBeInTheDocument();
  });

  it('shows an empty state with clear all when search has no results', async () => {
    const user = userEvent.setup();
    renderHome({ filters: <FilterProbe /> });
    await user.click(screen.getByRole('button', { name: 'set tomato query' }));
    await user.click(screen.getByRole('button', { name: 'low effort on' }));
    expect(screen.queryByRole('link', { name: /tomato soup/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /green salad/i })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: /no matches/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear all filters/i }));
    expect(screen.getByRole('link', { name: /tomato soup/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /green salad/i })).toBeInTheDocument();
  });

  it('filters by meal type when a category tab is selected', async () => {
    const user = userEvent.setup();
    saveSearchCategories([
      { id: 'dinner', label: 'Dinner', filters: { mealType: 'dinner' } },
      { id: 'dessert', label: 'Dessert', filters: { mealType: 'dessert' } },
    ]);
    resetSearchCategoriesCache();
    renderHome();
    await user.click(screen.getByRole('tab', { name: 'Dinner' }));
    expect(screen.getByRole('link', { name: /tomato soup/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /green salad/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Dessert' }));
    expect(screen.getByRole('link', { name: /green salad/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /tomato soup/i })).not.toBeInTheDocument();
  });
});
